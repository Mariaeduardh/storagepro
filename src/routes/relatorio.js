import { sql } from '../db.js';

export async function relatorioRoutes(app) {
  app.get('/relatorio', async (req, reply) => {
    const [totais] = await sql/*sql*/`
      SELECT
        COALESCE(SUM(v.quantidade * v.preco_venda),0) AS faturamento,
        COALESCE(SUM(v.quantidade),0) AS itens_vendidos
      FROM vendas v
    `;

    const [maisVendido] = await sql/*sql*/`
      SELECT p.nome, SUM(v.quantidade) AS qtd
      FROM vendas v
      JOIN produtos p ON p.id = v.produto_id
      GROUP BY p.nome
      ORDER BY qtd DESC
      LIMIT 1
    `;

    const validadeProxima = await sql/*sql*/`
      SELECT * FROM produtos
      WHERE validade IS NOT NULL
        AND validade <= (CURRENT_DATE + INTERVAL '7 days')
      ORDER BY validade ASC
      LIMIT 20
    `;

    return {
      faturamento: Number(totais?.faturamento || 0),
      itens_vendidos: Number(totais?.itens_vendidos || 0),
      produto_mais_vendido: maisVendido || null,
      validade_proxima: validadeProxima
    };
  });
}
