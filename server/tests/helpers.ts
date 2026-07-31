import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../src/db/connect.js';
import { Company, slugify } from '../src/modules/company/company.model.js';
import { User } from '../src/modules/auth/user.model.js';
import { Product } from '../src/modules/products/product.model.js';
import { Message } from '../src/modules/chat/message.model.js';
import { runAsSystem } from '../src/tenant/context.js';

let mongod: MongoMemoryServer;

export async function startDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri());
}

export async function stopDb(): Promise<void> {
  await disconnectDb();
  await mongod?.stop();
}

export async function resetDb(): Promise<void> {
  await Promise.all(
    [Product, Message].map((m) => m.collection.deleteMany({})),
  );
  await Promise.all([User.deleteMany({}), Company.deleteMany({})]);
}

export type Tenant = {
  companyId: string;
  admin: { id: string; email: string; password: string };
  member: { id: string; email: string; password: string };
};

export async function createTenant(name: string, products: string[] = []): Promise<Tenant> {
  const company = await Company.create({ name, slug: `${slugify(name)}-${Date.now()}` });
  const companyId = String(company._id);
  const password = 'senha1234';
  const passwordHash = await bcrypt.hash(password, 4);

  const admin = await User.create({
    companyId, name: `Admin ${name}`, email: `admin@${slugify(name)}.test`, passwordHash, role: 'admin',
  });
  const member = await User.create({
    companyId, name: `User ${name}`, email: `user@${slugify(name)}.test`, passwordHash, role: 'user',
  });

  if (products.length) {
    await runAsSystem(companyId, () =>
      Product.insertMany(
        products.map((productName, i) => ({
          name: productName,
          description: `Descrição de ${productName}`,
          price: 100 + i * 10,
          category: 'Geral',
          stock: 5,
        })),
      ),
    );
  }

  return {
    companyId,
    admin: { id: String(admin._id), email: admin.email, password },
    member: { id: String(member._id), email: member.email, password },
  };
}

export const objectId = () => new mongoose.Types.ObjectId().toString();
