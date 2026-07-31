import { createApp } from './app.js';
import { connectDb, disconnectDb } from './db/connect.js';
import { env } from './config/env.js';

const app = createApp();

await connectDb();

const server = app.listen(env.PORT, () => {
  console.log(`API ouvindo em http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = async (signal: string) => {
  console.log(`\n${signal} recebido, encerrando...`);
  server.close();
  await disconnectDb();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
