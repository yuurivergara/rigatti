import { MongoMemoryServer } from 'mongodb-memory-server';

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
