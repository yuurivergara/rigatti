import mongoose from 'mongoose';
import { env } from '../config/env.js';

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

export async function connectDb(uri: string = env.MONGO_URI): Promise<void> {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
  });
  await mongoose.syncIndexes();
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
