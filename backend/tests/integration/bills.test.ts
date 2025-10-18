import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/config/database';
import { createTestUser, getAuthToken, cleanupTestData } from '../helpers/testHelpers';

describe('Bills Module - Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let testAccountId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Criar usuário de teste
    const user = await createTestUser();
    userId = user.id;
    authToken = await getAuthToken(user.email, 'Test@123');

    // Criar conta de teste
    const account = await prisma.account.create({
      data: {
        name: 'Test Account',
        type: 'CHECKING',
        balance: 1000,
        userId,
      },
    });
    testAccountId = account.id;

    // Criar categoria de teste
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        userId,
      },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    await cleanupTestData(userId);
  });

  describe('POST /api/bills - Criar Bill', () => {
    it('deve criar uma bill com parcelas corretamente', async () => {
      const billData = {
        name: 'Aluguel',
        amount: 1500,
        date: '2025-01-01',
        repeatFreq: 'monthly',
        numberOfInstallments: 12,
        isFixedDay: true,
        categoryId: testCategoryId,
        accountId: testAccountId,
      };

      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send(billData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(billData.name);
      expect(response.body.data.amount).toBe(billData.amount);

      // Verificar se parcelas foram criadas no banco
      const installments = await prisma.billInstallment.findMany({
        where: { billId: response.body.data.id },
        orderBy: { installmentSequence: 'asc' },
      });

      expect(installments).toHaveLength(12);
      expect(installments[0].installmentSequence).toBe(1);
      expect(installments[11].installmentSequence).toBe(12);
      expect(installments[0].amount.toNumber()).toBe(1500);
    });

    it('deve gerar datas corretas para parcelas mensais', async () => {
      const billData = {
        name: 'Cartão de Crédito',
        amount: 500,
        date: '2025-01-15',
        repeatFreq: 'monthly',
        numberOfInstallments: 3,
        isFixedDay: true,
        categoryId: testCategoryId,
      };

      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send(billData)
        .expect(201);

      const installments = await prisma.billInstallment.findMany({
        where: { billId: response.body.data.id },
        orderBy: { installmentSequence: 'asc' },
      });

      // Verificar datas das parcelas
      expect(new Date(installments[0].dueDate).getDate()).toBe(15); // Dia 15
      expect(new Date(installments[1].dueDate).getDate()).toBe(15); // Dia 15
      expect(new Date(installments[2].dueDate).getDate()).toBe(15); // Dia 15

      // Verificar meses
      expect(new Date(installments[0].dueDate).getMonth()).toBe(0); // Janeiro
      expect(new Date(installments[1].dueDate).getMonth()).toBe(1); // Fevereiro
      expect(new Date(installments[2].dueDate).getMonth()).toBe(2); // Março
    });
  });

  describe('GET /api/bills - Listar Bills', () => {
    it('deve retornar todas as bills do usuário com contador de parcelas', async () => {
      const response = await request(app)
        .get('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verificar se tem _count.installments
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('_count');
        expect(response.body.data[0]._count).toHaveProperty('installments');
      }
    });
  });

  describe('GET /api/bills/installments/all - Listar Todas Parcelas', () => {
    it('deve retornar todas as parcelas com dados da bill', async () => {
      const response = await request(app)
        .get('/api/bills/installments/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verificar se parcelas têm dados da bill
      if (response.body.data.length > 0) {
        const installment = response.body.data[0];
        expect(installment).toHaveProperty('bill');
        expect(installment.bill).toHaveProperty('name');
        expect(installment.bill).toHaveProperty('amount');
      }
    });

    it('deve retornar parcelas ordenadas por data de vencimento', async () => {
      const response = await request(app)
        .get('/api/bills/installments/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const installments = response.body.data;
      
      // Verificar ordenação
      for (let i = 1; i < installments.length; i++) {
        const prevDate = new Date(installments[i - 1].dueDate);
        const currDate = new Date(installments[i].dueDate);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });
  });

  describe('GET /api/bills/:id/installments - Listar Parcelas de uma Bill', () => {
    let billId: string;

    beforeAll(async () => {
      const bill = await prisma.bill.create({
        data: {
          name: 'Test Bill for Installments',
          amount: 100,
          date: new Date('2025-01-01'),
          repeatFreq: 'monthly',
          numberOfInstallments: 5,
          isFixedDay: true,
          active: true,
          userId,
        },
      });
      billId = bill.id;

      // Criar parcelas manualmente
      for (let i = 1; i <= 5; i++) {
        await prisma.billInstallment.create({
          data: {
            billId,
            installmentSequence: i,
            dueDate: new Date(`2025-0${i}-01`),
            amount: 100,
            amountPaid: 0,
            paid: false,
          },
        });
      }
    });

    it('deve retornar todas as parcelas da bill específica', async () => {
      const response = await request(app)
        .get(`/api/bills/${billId}/installments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.data[0].billId).toBe(billId);
    });
  });

  describe('PUT /api/bills/installments/:id - Atualizar Parcela', () => {
    let installmentId: string;

    beforeAll(async () => {
      const bill = await prisma.bill.create({
        data: {
          name: 'Bill for Update Test',
          amount: 200,
          date: new Date('2025-01-01'),
          repeatFreq: 'monthly',
          numberOfInstallments: 1,
          isFixedDay: true,
          active: true,
          userId,
        },
      });

      const installment = await prisma.billInstallment.create({
        data: {
          billId: bill.id,
          installmentSequence: 1,
          dueDate: new Date('2025-01-01'),
          amount: 200,
          amountPaid: 0,
          paid: false,
        },
      });
      installmentId = installment.id;
    });

    it('deve atualizar valor da parcela', async () => {
      const updateData = {
        amount: 250,
      };

      const response = await request(app)
        .put(`/api/bills/installments/${installmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(250);

      // Verificar no banco
      const installment = await prisma.billInstallment.findUnique({
        where: { id: installmentId },
      });
      expect(installment?.amount.toNumber()).toBe(250);
    });

    it('deve atualizar data de vencimento da parcela', async () => {
      const updateData = {
        dueDate: '2025-01-15',
      };

      const response = await request(app)
        .put(`/api/bills/installments/${installmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verificar no banco
      const installment = await prisma.billInstallment.findUnique({
        where: { id: installmentId },
      });
      expect(new Date(installment!.dueDate).getDate()).toBe(15);
    });
  });

  describe('DELETE /api/bills/installments/:id - Excluir Parcela', () => {
    let billId: string;
    let lastInstallmentId: string;

    beforeEach(async () => {
      const bill = await prisma.bill.create({
        data: {
          name: 'Bill for Delete Test',
          amount: 100,
          date: new Date('2025-01-01'),
          repeatFreq: 'monthly',
          numberOfInstallments: 3,
          isFixedDay: true,
          active: true,
          userId,
        },
      });
      billId = bill.id;

      // Criar 3 parcelas
      for (let i = 1; i <= 3; i++) {
        const installment = await prisma.billInstallment.create({
          data: {
            billId,
            installmentSequence: i,
            dueDate: new Date(`2025-0${i}-01`),
            amount: 100,
            amountPaid: 0,
            paid: false,
          },
        });
        if (i === 3) lastInstallmentId = installment.id;
      }
    });

    it('deve excluir a última parcela não paga', async () => {
      const response = await request(app)
        .delete(`/api/bills/installments/${lastInstallmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar no banco
      const installment = await prisma.billInstallment.findUnique({
        where: { id: lastInstallmentId },
      });
      expect(installment).toBeNull();

      // Verificar que ainda existem 2 parcelas
      const remaining = await prisma.billInstallment.count({
        where: { billId },
      });
      expect(remaining).toBe(2);
    });
  });

  describe('GET /api/bills/statistics - Estatísticas', () => {
    it('deve retornar estatísticas corretas das bills', async () => {
      const response = await request(app)
        .get('/api/bills/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(typeof response.body.data.total).toBe('number');
    });
  });

  describe('Sincronização com Banco de Dados', () => {
    it('REGRA: Contador de parcelas deve refletir exatamente o que está no banco', async () => {
      // Criar bill
      const bill = await prisma.bill.create({
        data: {
          name: 'Sync Test Bill',
          amount: 100,
          date: new Date('2025-01-01'),
          repeatFreq: 'monthly',
          numberOfInstallments: 5,
          isFixedDay: true,
          active: true,
          userId,
        },
      });

      // Criar 3 parcelas (menos que numberOfInstallments)
      for (let i = 1; i <= 3; i++) {
        await prisma.billInstallment.create({
          data: {
            billId: bill.id,
            installmentSequence: i,
            dueDate: new Date(`2025-0${i}-01`),
            amount: 100,
            amountPaid: 0,
            paid: false,
          },
        });
      }

      // Buscar via API
      const response = await request(app)
        .get('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const billFromApi = response.body.data.find((b: any) => b.id === bill.id);
      
      // REGRA: _count.installments DEVE ser 3 (o que está no banco), NÃO 5 (numberOfInstallments)
      expect(billFromApi._count.installments).toBe(3);
    });

    it('REGRA: Valores calculados devem usar dados reais do banco', async () => {
      // Criar bill
      const bill = await prisma.bill.create({
        data: {
          name: 'Calculation Test Bill',
          amount: 100,
          date: new Date('2025-01-01'),
          repeatFreq: 'monthly',
          numberOfInstallments: 5,
          isFixedDay: true,
          active: true,
          userId,
        },
      });

      // Criar parcelas com valores diferentes
      await prisma.billInstallment.create({
        data: {
          billId: bill.id,
          installmentSequence: 1,
          dueDate: new Date('2025-01-01'),
          amount: 100,
          amountPaid: 0,
          paid: false,
        },
      });

      await prisma.billInstallment.create({
        data: {
          billId: bill.id,
          installmentSequence: 2,
          dueDate: new Date('2025-02-01'),
          amount: 150, // Valor diferente
          amountPaid: 0,
          paid: false,
        },
      });

      // Buscar todas as parcelas
      const response = await request(app)
        .get('/api/bills/installments/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const billInstallments = response.body.data.filter((i: any) => i.billId === bill.id);
      
      // REGRA: Soma dos valores deve ser 250 (100 + 150), não 200 (2 * 100)
      const totalAmount = billInstallments.reduce((sum: number, i: any) => sum + i.amount, 0);
      expect(totalAmount).toBe(250);
    });
  });
});
