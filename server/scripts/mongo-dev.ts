import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * MongoDB descartável para quem quer rodar o projeto sem instalar nada.
 * Os dados vivem só enquanto o processo estiver de pé.
 */
const server = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: 'catalogo' },
});

console.log(`MongoDB de desenvolvimento em ${server.getUri('catalogo')}`);
console.log('Ctrl+C para encerrar. Os dados são perdidos ao sair.');

const stop = async () => {
  await server.stop();
  process.exit(0);
};

process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());
