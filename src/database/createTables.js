import { sql } from './db.js';

async function migrate() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS produtos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        categoria TEXT,
        quantidade INTEGER NOT NULL DEFAULT 0,
        preco_compra NUMERIC(10,2) NOT NULL,
        preco_venda NUMERIC(10,2) NOT NULL,
        validade DATE
      );
    `;

    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS vendas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
        quantidade INTEGER NOT NULL,
        data_venda TIMESTAMP NOT NULL DEFAULT NOW(),
        preco_venda NUMERIC(10,2) NOT NULL
      );
    `;

    console.log('Migração concluída com sucesso.');
  } catch (e) {
    console.error('Erro na migração:', e);
  } finally {
    await sql.end();
  }
}

migrate();
