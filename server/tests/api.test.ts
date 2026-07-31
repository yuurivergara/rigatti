import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { startDb, stopDb, resetDb, createTenant, type Tenant } from './helpers.js';

const app = createApp();

const login = async (email: string, password: string): Promise<string> => {
  const res = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
  return res.body.token;
};

describe('API de autenticação e permissões', () => {
  let alpha: Tenant;
  let beta: Tenant;

  beforeAll(startDb);
  afterAll(stopDb);

  beforeEach(async () => {
    await resetDb();
    alpha = await createTenant('Alpha', ['Cadeira Alpha']);
    beta = await createTenant('Beta', ['Notebook Beta']);
  });

  it('registra empresa e devolve o criador como admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        companyName: 'Nova Loja',
        name: 'Fulano',
        email: 'fulano@nova.test',
        password: 'senha1234',
      })
      .expect(201);

    expect(res.body.user.role).toBe('admin');
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejeita credenciais inválidas e requisição sem token', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: alpha.admin.email, password: 'errada' })
      .expect(401);

    await request(app).get('/api/products').expect(401);
  });

  it('admin cria produto, user comum recebe 403', async () => {
    const adminToken = await login(alpha.admin.email, alpha.admin.password);
    const userToken = await login(alpha.member.email, alpha.member.password);

    const payload = {
      name: 'Produto Novo',
      description: 'Criado pelo admin',
      price: 199.9,
      category: 'Geral',
    };

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload)
      .expect(201);

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(403);

    await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  it('a listagem só traz produtos da empresa do token', async () => {
    const alphaToken = await login(alpha.admin.email, alpha.admin.password);
    const betaToken = await login(beta.admin.email, beta.admin.password);

    const alphaRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${alphaToken}`)
      .expect(200);
    const betaRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${betaToken}`)
      .expect(200);

    expect(alphaRes.body.items.map((p: { name: string }) => p.name)).toEqual(['Cadeira Alpha']);
    expect(betaRes.body.items.map((p: { name: string }) => p.name)).toEqual(['Notebook Beta']);

    const alphaProductId = alphaRes.body.items[0].id;
    await request(app)
      .get(`/api/products/${alphaProductId}`)
      .set('Authorization', `Bearer ${betaToken}`)
      .expect(404);
  });

  it('não expõe companyId nas respostas', async () => {
    const token = await login(alpha.admin.email, alpha.admin.password);
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.items[0].companyId).toBeUndefined();
  });

  it('valida o payload e devolve 422 com os campos com erro', async () => {
    const token = await login(alpha.admin.email, alpha.admin.password);
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x', price: -1 })
      .expect(422);

    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});
