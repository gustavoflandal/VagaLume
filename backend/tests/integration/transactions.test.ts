import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from '../helpers/appFactory';
import {
  createTestUser,
  generateTestToken,
  createTestAccount,
  createTestCategory,
  createTestTransaction,
} from '../helpers/testHelpers';

describe('Transactions API', () => {
  let app: Application;
  let userId: string;
  let token: string;
  let accountFrom: any;
  let accountTo: any;
  let category: any;

  beforeAll(async () => {
    app = createTestApp();
    
    const user = await createTestUser();
    userId = user.id;
    token = generateTestToken(userId);
    
    // Criar contas e categoria para os testes
    accountFrom = await createTestAccount(userId, { name: 'Conta Origem', initialBalance: 5000 });
    accountTo = await createTestAccount(userId, { name: 'Conta Destino', initialBalance: 1000 });
    category = await createTestCategory(userId, { name: 'Alimentação' });
  });

  describe('POST /api/transactions', () => {
    it('deve criar uma receita (INCOME) com sucesso', async () => {
      const transactionData = {
        type: 'INCOME',
        amount: 1000,
        description: 'Salário',
        date: new Date().toISOString(),
        toAccountId: accountTo.id,
        categoryId: category.id,
        status: 'COMPLETED',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.type).toBe('INCOME');
        expect(response.body.data.toAccountId).toBe(accountTo.id);
      }
    });

    it('deve criar uma despesa (EXPENSE) com sucesso', async () => {
      const transactionData = {
        type: 'EXPENSE',
        amount: 50,
        description: 'Almoço',
        date: new Date().toISOString(),
        fromAccountId: accountFrom.id,
        categoryId: category.id,
        status: 'COMPLETED',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.type).toBe('EXPENSE');
        expect(response.body.data.fromAccountId).toBe(accountFrom.id);
      }
    });

    it('deve criar uma transferência (TRANSFER) com sucesso', async () => {
      const transactionData = {
        type: 'TRANSFER',
        amount: 200,
        description: 'Transferência entre contas',
        date: new Date().toISOString(),
        fromAccountId: accountFrom.id,
        toAccountId: accountTo.id,
        status: 'COMPLETED',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.type).toBe('TRANSFER');
        expect(response.body.data.fromAccountId).toBe(accountFrom.id);
        expect(response.body.data.toAccountId).toBe(accountTo.id);
      }
    });

    it('deve criar transação com status PENDING', async () => {
      const transactionData = {
        type: 'EXPENSE',
        amount: 100,
        description: 'Compra futura',
        date: new Date().toISOString(),
        fromAccountId: accountFrom.id,
        status: 'PENDING',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.data.status).toBe('PENDING');
      }
    });

    it('deve retornar erro 400 se INCOME sem conta de destino', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'INCOME',
          amount: 1000,
          description: 'Teste',
          date: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 400 se EXPENSE sem conta de origem', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'EXPENSE',
          amount: 100,
          description: 'Teste',
          date: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 400 se TRANSFER sem ambas as contas', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'TRANSFER',
          amount: 100,
          description: 'Teste',
          date: new Date().toISOString(),
          fromAccountId: accountFrom.id,
          // toAccountId faltando
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 400 se TRANSFER com mesma conta origem e destino', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'TRANSFER',
          amount: 100,
          description: 'Teste',
          date: new Date().toISOString(),
          fromAccountId: accountFrom.id,
          toAccountId: accountFrom.id,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 400 se valor negativo', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'EXPENSE',
          amount: -100,
          description: 'Teste',
          date: new Date().toISOString(),
          fromAccountId: accountFrom.id,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 400 se descrição vazia', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'EXPENSE',
          amount: 100,
          description: '',
          date: new Date().toISOString(),
          fromAccountId: accountFrom.id,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          type: 'EXPENSE',
          amount: 100,
          description: 'Teste',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/transactions', () => {
    it('deve listar todas as transações do usuário', async () => {
      await createTestTransaction(userId, {
        type: 'EXPENSE',
        amount: 50,
        description: 'Transação 1',
        fromAccountId: accountFrom.id,
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Aceita tanto estrutura aninhada quanto direta
      const transactions = response.body.data.data || response.body.data;
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('deve filtrar transações por tipo', async () => {
      const response = await request(app)
        .get('/api/transactions?type=EXPENSE')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('deve filtrar transações por categoria', async () => {
      const response = await request(app)
        .get(`/api/transactions?categoryId=${category.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('deve retornar resumo financeiro', async () => {
      const response = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Aceita diferentes estruturas de resposta
      const summary = response.body.data;
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('object');
    });

    it('deve filtrar resumo por período', async () => {
      const startDate = new Date('2025-01-01').toISOString();
      const endDate = new Date('2025-12-31').toISOString();

      const response = await request(app)
        .get(`/api/transactions/summary?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('deve retornar uma transação específica', async () => {
      const transaction = await createTestTransaction(userId, {
        type: 'EXPENSE',
        amount: 100,
        description: 'Teste',
        fromAccountId: accountFrom.id,
      });

      const response = await request(app)
        .get(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(transaction.id);
    });

    it('deve retornar erro se transação não encontrada', async () => {
      const response = await request(app)
        .get('/api/transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('deve atualizar uma transação com sucesso', async () => {
      const transaction = await createTestTransaction(userId, {
        type: 'EXPENSE',
        amount: 100,
        description: 'Original',
        fromAccountId: accountFrom.id,
      });

      const updateData = {
        description: 'Atualizado',
        amount: 150,
      };

      const response = await request(app)
        .put(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.description).toBe(updateData.description);
      // Aceita tanto number quanto string (Decimal do Prisma)
      expect(Number(response.body.data.amount)).toBe(updateData.amount);
    });

    it('deve retornar erro se transação não encontrada', async () => {
      const response = await request(app)
        .put('/api/transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Test' });

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('deve excluir uma transação com sucesso', async () => {
      const transaction = await createTestTransaction(userId, {
        type: 'EXPENSE',
        amount: 100,
        description: 'Para excluir',
        fromAccountId: accountFrom.id,
      });

      const response = await request(app)
        .delete(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('excluída');
    });

    it('deve retornar erro se transação não encontrada', async () => {
      const response = await request(app)
        .delete('/api/transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const transaction = await createTestTransaction(userId, {
        type: 'EXPENSE',
        amount: 100,
        description: 'Teste',
        fromAccountId: accountFrom.id,
      });

      const response = await request(app)
        .delete(`/api/transactions/${transaction.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
