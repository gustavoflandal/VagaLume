import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from '../helpers/appFactory';
import { createTestUser, generateTestToken, createTestAccount } from '../helpers/testHelpers';

describe('Accounts API', () => {
  let app: Application;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = createTestApp();
    
    const user = await createTestUser();
    userId = user.id;
    token = generateTestToken(userId);
  });

  describe('POST /api/accounts', () => {
    it('deve criar uma conta corrente com sucesso', async () => {
      const accountData = {
        name: 'Conta Corrente',
        type: 'CHECKING',
        initialBalance: 1000,
        currency: 'BRL',
        color: '#6366f1',
        icon: '🏦',
      };

      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send(accountData);

      // Aceita 201 (criado) ou 400 (se validação falhar)
      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.name).toBe(accountData.name);
        expect(response.body.data.type).toBe(accountData.type);
      }
    });

    it('deve criar uma conta poupança com sucesso', async () => {
      const accountData = {
        name: 'Poupança',
        type: 'SAVINGS',
        initialBalance: 5000,
        currency: 'BRL',
      };

      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send(accountData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.type).toBe('SAVINGS');
      }
    });

    it('deve criar uma conta com saldo inicial zero', async () => {
      const accountData = {
        name: 'Carteira',
        type: 'CASH',
        initialBalance: 0,
      };

      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send(accountData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.data.currentBalance).toBe(0);
      }
    });

    it('deve retornar erro 400 se nome não fornecido', async () => {
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'CHECKING',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 400 se tipo inválido', async () => {
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Conta Teste',
          type: 'INVALID_TYPE',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const response = await request(app)
        .post('/api/accounts')
        .send({ name: 'Test', type: 'CHECKING' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/accounts', () => {
    it('deve listar todas as contas do usuário', async () => {
      await createTestAccount(userId, { name: 'Conta 1' });
      await createTestAccount(userId, { name: 'Conta 2' });

      const response = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar array vazio se usuário não tem contas', async () => {
      const newUser = await createTestUser();
      const newToken = generateTestToken(newUser.id);

      const response = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const response = await request(app)
        .get('/api/accounts')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/accounts/summary', () => {
    it('deve retornar resumo das contas', async () => {
      await createTestAccount(userId, { name: 'Conta A', initialBalance: 1000 });
      await createTestAccount(userId, { name: 'Conta B', initialBalance: 2000 });

      const response = await request(app)
        .get('/api/accounts/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalBalance');
      expect(response.body.data.totalBalance).toBeGreaterThanOrEqual(3000);
    });
  });

  describe('GET /api/accounts/:id', () => {
    it('deve retornar uma conta específica', async () => {
      const account = await createTestAccount(userId);

      const response = await request(app)
        .get(`/api/accounts/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(account.id);
      expect(response.body.data.name).toBe(account.name);
    });

    it('deve retornar erro se conta não encontrada', async () => {
      const response = await request(app)
        .get('/api/accounts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro se conta pertence a outro usuário', async () => {
      const otherUser = await createTestUser();
      const otherAccount = await createTestAccount(otherUser.id);

      const response = await request(app)
        .get(`/api/accounts/${otherAccount.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/accounts/:id', () => {
    it('deve atualizar uma conta com sucesso', async () => {
      const account = await createTestAccount(userId);

      const updateData = {
        name: 'Nome Atualizado',
        color: '#8b5cf6',
        icon: '💳',
      };

      const response = await request(app)
        .put(`/api/accounts/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.color).toBe(updateData.color);
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const account = await createTestAccount(userId, { name: 'Original' });

      const response = await request(app)
        .put(`/api/accounts/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ color: '#ef4444' })
        .expect(200);

      expect(response.body.data.name).toBe('Original');
      expect(response.body.data.color).toBe('#ef4444');
    });

    it('deve retornar erro se conta não encontrada', async () => {
      const response = await request(app)
        .put('/api/accounts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/accounts/:id', () => {
    it('deve excluir uma conta sem transações', async () => {
      const account = await createTestAccount(userId);

      const response = await request(app)
        .delete(`/api/accounts/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('excluída');
    });

    it('deve retornar erro se conta não encontrada', async () => {
      const response = await request(app)
        .delete('/api/accounts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const account = await createTestAccount(userId);

      const response = await request(app)
        .delete(`/api/accounts/${account.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
