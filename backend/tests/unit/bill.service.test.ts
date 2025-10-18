import billService from '@/services/bill.service';
import { prisma } from '@/config/database';

// Mock do Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    bill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    billInstallment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Bill Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateNextDate', () => {
    it('deve calcular próxima data mensal corretamente', () => {
      const currentDate = new Date('2025-01-15');
      const nextDate = billService.calculateNextDate(currentDate, 'monthly', true);
      
      expect(nextDate.getMonth()).toBe(1); // Fevereiro
      expect(nextDate.getDate()).toBe(15); // Mesmo dia
    });

    it('deve calcular próxima data semanal corretamente', () => {
      const currentDate = new Date('2025-01-15');
      const nextDate = billService.calculateNextDate(currentDate, 'weekly', false);
      
      const diffDays = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('deve calcular próxima data anual corretamente', () => {
      const currentDate = new Date('2025-01-15');
      const nextDate = billService.calculateNextDate(currentDate, 'yearly', true);
      
      expect(nextDate.getFullYear()).toBe(2026);
      expect(nextDate.getMonth()).toBe(0); // Janeiro
      expect(nextDate.getDate()).toBe(15);
    });

    it('deve ajustar dia quando isFixedDay=false e mês não tem o dia', () => {
      const currentDate = new Date('2025-01-31');
      const nextDate = billService.calculateNextDate(currentDate, 'monthly', false);
      
      // Fevereiro não tem dia 31, deve ajustar para último dia
      expect(nextDate.getMonth()).toBe(1); // Fevereiro
      expect(nextDate.getDate()).toBeLessThanOrEqual(29);
    });
  });

  describe('generateInstallments', () => {
    it('deve gerar número correto de parcelas', async () => {
      const mockBill = {
        id: 'bill-1',
        name: 'Test Bill',
        amount: 100,
        date: new Date('2025-01-01'),
        repeatFreq: 'monthly',
        numberOfInstallments: 12,
        isFixedDay: true,
        active: true,
        userId: 'user-1',
        categoryId: null,
        accountId: null,
        objectGroupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.billInstallment.createMany as jest.Mock).mockResolvedValue({ count: 12 });
      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue(
        Array.from({ length: 12 }, (_, i) => ({
          id: `inst-${i + 1}`,
          billId: 'bill-1',
          installmentSequence: i + 1,
          dueDate: new Date(`2025-${String(i + 1).padStart(2, '0')}-01`),
          amount: 100,
          amountPaid: 0,
          paid: false,
          paidAt: null,
          transactionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      const installments = await billService.generateInstallments(mockBill);
      
      expect(installments).toHaveLength(12);
      expect(prisma.billInstallment.createMany).toHaveBeenCalledTimes(1);
    });

    it('deve gerar parcelas com sequência correta', async () => {
      const mockBill = {
        id: 'bill-1',
        name: 'Test Bill',
        amount: 100,
        date: new Date('2025-01-01'),
        repeatFreq: 'monthly',
        numberOfInstallments: 3,
        isFixedDay: true,
        active: true,
        userId: 'user-1',
        categoryId: null,
        accountId: null,
        objectGroupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInstallments = [
        { installmentSequence: 1, dueDate: new Date('2025-01-01'), amount: 100 },
        { installmentSequence: 2, dueDate: new Date('2025-02-01'), amount: 100 },
        { installmentSequence: 3, dueDate: new Date('2025-03-01'), amount: 100 },
      ];

      (prisma.billInstallment.createMany as jest.Mock).mockResolvedValue({ count: 3 });
      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue(mockInstallments);

      const installments = await billService.generateInstallments(mockBill);
      
      expect(installments[0].installmentSequence).toBe(1);
      expect(installments[1].installmentSequence).toBe(2);
      expect(installments[2].installmentSequence).toBe(3);
    });
  });

  describe('findAll', () => {
    it('deve incluir contador de parcelas (_count)', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          name: 'Test Bill',
          amount: 100,
          _count: { installments: 5 },
        },
      ];

      (prisma.bill.findMany as jest.Mock).mockResolvedValue(mockBills);

      const bills = await billService.findAll('user-1');
      
      expect(bills[0]).toHaveProperty('_count');
      expect(bills[0]._count.installments).toBe(5);
      expect(prisma.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.objectContaining({
              select: { installments: true },
            }),
          }),
        })
      );
    });
  });

  describe('getAllInstallments', () => {
    it('deve incluir dados da bill em cada parcela', async () => {
      const mockInstallments = [
        {
          id: 'inst-1',
          billId: 'bill-1',
          installmentSequence: 1,
          dueDate: new Date('2025-01-01'),
          amount: 100,
          bill: {
            id: 'bill-1',
            name: 'Test Bill',
            amount: 100,
            repeatFreq: 'monthly',
          },
        },
      ];

      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue(mockInstallments);

      const installments = await billService.getAllInstallments('user-1');
      
      expect(installments[0]).toHaveProperty('bill');
      expect(installments[0].bill).toHaveProperty('name');
      expect(installments[0].bill.name).toBe('Test Bill');
    });

    it('deve retornar parcelas ordenadas por data de vencimento', async () => {
      const mockInstallments = [
        {
          id: 'inst-1',
          dueDate: new Date('2025-01-01'),
          bill: { name: 'Bill 1' },
        },
        {
          id: 'inst-2',
          dueDate: new Date('2025-02-01'),
          bill: { name: 'Bill 2' },
        },
      ];

      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue(mockInstallments);

      await billService.getAllInstallments('user-1');
      
      expect(prisma.billInstallment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dueDate: 'asc' },
        })
      );
    });
  });

  describe('Regras de Sincronização', () => {
    it('REGRA: findAll deve sempre incluir _count.installments do banco', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          numberOfInstallments: 12, // Configurado para 12
          _count: { installments: 5 }, // Mas só tem 5 no banco
        },
      ];

      (prisma.bill.findMany as jest.Mock).mockResolvedValue(mockBills);

      const bills = await billService.findAll('user-1');
      
      // REGRA: Deve retornar o contador real do banco (5), não o configurado (12)
      expect(bills[0]._count.installments).toBe(5);
    });

    it('REGRA: getAllInstallments deve incluir dados da bill relacionada', async () => {
      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue([]);

      await billService.getAllInstallments('user-1');
      
      // REGRA: Deve sempre incluir o relacionamento com bill
      expect(prisma.billInstallment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            bill: expect.any(Object),
          }),
        })
      );
    });

    it('REGRA: updateInstallment não deve permitir atualizar parcela paga', async () => {
      const mockInstallment = {
        id: 'inst-1',
        paid: true,
        billId: 'bill-1',
      };

      (prisma.billInstallment.findUnique as jest.Mock).mockResolvedValue(mockInstallment);

      await expect(
        billService.updateInstallment('inst-1', { amount: 200 }, 'user-1')
      ).rejects.toThrow('Não é possível atualizar uma parcela já paga');
    });

    it('REGRA: deleteInstallment não deve permitir excluir parcela paga', async () => {
      const mockInstallment = {
        id: 'inst-1',
        paid: true,
        installmentSequence: 5,
        billId: 'bill-1',
      };

      (prisma.billInstallment.findUnique as jest.Mock).mockResolvedValue(mockInstallment);
      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue([mockInstallment]);

      await expect(
        billService.deleteInstallment('inst-1', 'user-1')
      ).rejects.toThrow('Não é possível excluir uma parcela já paga');
    });

    it('REGRA: deleteInstallment só deve permitir excluir última parcela', async () => {
      const mockInstallment = {
        id: 'inst-1',
        paid: false,
        installmentSequence: 3,
        billId: 'bill-1',
      };

      const allInstallments = [
        { installmentSequence: 1 },
        { installmentSequence: 2 },
        { installmentSequence: 3 },
        { installmentSequence: 4 }, // Existe parcela 4, então 3 não é a última
      ];

      (prisma.billInstallment.findUnique as jest.Mock).mockResolvedValue(mockInstallment);
      (prisma.billInstallment.findMany as jest.Mock).mockResolvedValue(allInstallments);

      await expect(
        billService.deleteInstallment('inst-1', 'user-1')
      ).rejects.toThrow('Apenas a última parcela pode ser excluída');
    });
  });
});
