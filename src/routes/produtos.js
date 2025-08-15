import { z } from 'zod';
import { sql } from '../database/db.js';



export async function produtosRoutes(app) {
  // Listar
  app.get('/produtos', async (req, reply) => {
    const { search } = req.query || {};
    let rows;
    if (search) {
      rows = await sql/*sql*/`
        SELECT * FROM produtos
        WHERE nome ILIKE ${'%' + search + '%'}
        ORDER BY nome
      `;
    } else {
      rows = await sql/*sql*/`SELECT * FROM produtos ORDER BY nome`;
    }
    return rows;
  });

  // Criar
  app.post('/produtos', async (req, reply) => {
    const bodySchema = z.object({
      nome: z.string().min(1),
      categoria: z.string().optional(),
      quantidade: z.coerce.number().int().min(0),
      preco_compra: z.coerce.number().min(0),
      preco_venda: z.coerce.number().min(0.01),
      validade: z.string().date().optional().or(z.null())
    });

    const data = bodySchema.parse(req.body);

    await sql/*sql*/`
      INSERT INTO produtos (nome, categoria, quantidade, preco_compra, preco_venda, validade)
      VALUES (${data.nome}, ${data.categoria || null}, ${data.quantidade},
              ${data.preco_compra}, ${data.preco_venda},
              ${data.validade || null})
    `;

    return reply.code(201).send({ ok: true });
  });

  // Atualizar
  app.put('/produtos/:id', async (req, reply) => {
    const idSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      nome: z.string().min(1),
      categoria: z.string().optional(),
      quantidade: z.coerce.number().int().min(0),
      preco_compra: z.coerce.number().min(0),
      preco_venda: z.coerce.number().min(0.01),
      validade: z.string().date().optional().or(z.null())
    });

    const { id } = idSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    await sql/*sql*/`
      UPDATE produtos
      SET nome=${data.nome},
          categoria=${data.categoria || null},
          quantidade=${data.quantidade},
          preco_compra=${data.preco_compra},
          preco_venda=${data.preco_venda},
          validade=${data.validade || null}
      WHERE id=${id}
    `;

    return reply.code(204).send();
  });

  // Remover
  app.delete('/produtos/:id', async (req, reply) => {
    const idSchema = z.object({ id: z.string().uuid() });
    const { id } = idSchema.parse(req.params);
    await sql/*sql*/`DELETE FROM produtos WHERE id=${id}`;
    return reply.code(204).send();
  });
}
