import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { produtosRoutes } from './src/routes/produtos.js';
import { vendasRoutes } from './src/routes/vendas.js';
import { relatorioRoutes } from './src/routes/relatorio.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: [
    'http://localhost:8080',
    'http://localhost:5500',
    'https://https://storagepro.netlify.app/'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

app.get('/ping', () => ({ ok: true }));

app.register(produtosRoutes);
app.register(vendasRoutes);
app.register(relatorioRoutes);

const port = process.env.PORT || 3333;
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`API rodando na porta ${port}`);
});
