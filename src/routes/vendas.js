import { z } from 'zod';
import { sql } from '../db.js';

export async function vendasRoutes(app) {
  // Registrar venda
  app.post('/vendas', async (req, reply) => {
    const bodySchema = z.object({
      produto_id: z.string().uuid(),
      quantidade: z.coerce.number().int().positive()
    });

    const { produto_id, quantidade } = bodySchema.parse(req.body);

    // Atualiza estoque e registra venda numa transação
    await sql.begin(async (trx) => {
      const [produto] = await trx/*sql*/`
        SELECT id, quantidade, preco_venda FROM produtos WHERE id=${produto_id} FOR UPDATE
      `;
      if (!produto) return reply.code(404).send({ error: 'Produto não encontrado' });
      if (produto.quantidade < quantidade) {
        return reply.code(400).send({ error: 'Estoque insuficiente' });
      }

      await trx/*sql*/`
        UPDATE produtos SET quantidade = quantidade - ${quantidade} WHERE id=${produto_id}
      `;

      await trx/*sql*/`
        INSERT INTO vendas (produto_id, quantidade, preco_venda)
        VALUES (${produto_id}, ${quantidade}, ${produto.preco_venda})
      `;
    });

    return reply.code(201).send({ ok: true });
  });
}
