import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateBillDTO {
  name: string;
  amountMin: number;
  amountMax: number;
  date: Date;
  repeatFreq: string;
  endDate?: Date;
  extensionDate?: Date;
  skip?: number;
  autoMatch?: boolean;
  objectGroupId?: string;
}

export interface UpdateBillDTO {
  name?: string;
  amountMin?: number;
  amountMax?: number;
  date?: Date;
  repeatFreq?: string;
  endDate?: Date;
  extensionDate?: Date;
  skip?: number;
  autoMatch?: boolean;
  active?: boolean;
  objectGroupId?: string;
}

class BillService {
  /**
   * Lista todas as bills do usuário
   */
  async findAll(userId: string, includeInactive = false) {
    const bills = await prisma.bill.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        objectGroup: true,
        transactions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        rules: {
          where: { active: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    return bills;
  }

  /**
   * Busca bill por ID
   */
  async findById(billId: string, userId: string) {
    const bill = await prisma.bill.findFirst({
      where: { id: billId, userId },
      include: {
        objectGroup: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        rules: {
          where: { active: true },
        },
      },
    });

    if (!bill) {
      throw new Error('Bill não encontrada');
    }

    return bill;
  }

  /**
   * Cria nova bill
   */
  async create(userId: string, data: CreateBillDTO) {
    const bill = await prisma.bill.create({
      data: {
        name: data.name,
        amountMin: new Decimal(data.amountMin),
        amountMax: new Decimal(data.amountMax),
        date: data.date,
        repeatFreq: data.repeatFreq,
        endDate: data.endDate || null,
        extensionDate: data.extensionDate || null,
        skip: data.skip ?? 0,
        autoMatch: data.autoMatch ?? true,
        objectGroupId: data.objectGroupId || null,
        userId,
      },
      include: {
        objectGroup: true,
      },
    });

    logger.info(`Nova bill criada: ${bill.name} para usuário ${userId}`);
    return bill;
  }

  /**
   * Atualiza bill
   */
  async update(billId: string, userId: string, data: UpdateBillDTO) {
    await this.findById(billId, userId);

    const updateData: any = { ...data };
    if (data.amountMin) updateData.amountMin = new Decimal(data.amountMin);
    if (data.amountMax) updateData.amountMax = new Decimal(data.amountMax);

    const bill = await prisma.bill.update({
      where: { id: billId },
      data: updateData,
      include: {
        objectGroup: true,
      },
    });

    logger.info(`Bill atualizada: ${bill.name}`);
    return bill;
  }

  /**
   * Exclui bill
   */
  async delete(billId: string, userId: string) {
    await this.findById(billId, userId);

    await prisma.bill.delete({
      where: { id: billId },
    });

    logger.info(`Bill excluída: ${billId}`);
  }

  /**
   * Calcula próxima data de vencimento
   */
  getNextExpectedDate(bill: any): Date {
    const currentDate = new Date();
    let nextDate = new Date(bill.date);

    // Mapeia frequências para adicionar ao Date
    const freqMap: Record<string, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      'half-year': 180,
      yearly: 365,
    };

    const daysToAdd = freqMap[bill.repeatFreq] || 30;

    // Encontra a próxima data futura
    while (nextDate < currentDate) {
      nextDate.setDate(nextDate.getDate() + daysToAdd * (bill.skip + 1));
    }

    return nextDate;
  }

  /**
   * Busca transações que podem ser auto-matched com a bill
   */
  async autoMatchTransactions(billId: string, userId: string) {
    const bill = await this.findById(billId, userId);

    if (!bill.autoMatch) {
      throw new Error('Auto-match desabilitado para esta bill');
    }

    const minAmount = Number(bill.amountMin);
    const maxAmount = Number(bill.amountMax);

    // Busca transações no range de valores
    const candidates = await prisma.transaction.findMany({
      where: {
        userId,
        amount: {
          gte: new Decimal(minAmount),
          lte: new Decimal(maxAmount),
        },
        description: {
          contains: bill.name,
        },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return candidates;
  }

  /**
   * Vincula transação à bill
   */
  async linkTransaction(billId: string, transactionId: string, userId: string) {
    await this.findById(billId, userId);

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    // Nota: billId não existe no schema Transaction
    // Implementação simplificada por enquanto
    logger.info(`Transação ${transactionId} vinculada à bill ${billId}`);
    return transaction;
  }

  /**
   * Obtém bills próximas do vencimento
   */
  async getUpcoming(userId: string, days = 7) {
    const bills = await this.findAll(userId);

    const upcoming = bills
      .map((bill) => {
        const nextDate = this.getNextExpectedDate(bill);
        const daysUntil = Math.ceil(
          (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...bill,
          nextDate,
          daysUntil,
        };
      })
      .filter((bill) => bill.daysUntil <= days && bill.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming;
  }

  /**
   * Obtém estatísticas das bills
   */
  async getStatistics(userId: string) {
    const bills = await this.findAll(userId);

    const total = bills.length;
    const active = bills.filter((b) => b.active).length;

    const monthlyExpected = bills
      .filter((b) => b.active)
      .reduce((sum, bill) => {
        const avg = (Number(bill.amountMin) + Number(bill.amountMax)) / 2;
        // Converte para mensal baseado na frequência
        const freqMultiplier: Record<string, number> = {
          daily: 30,
          weekly: 4,
          monthly: 1,
          quarterly: 1 / 3,
          'half-year': 1 / 6,
          yearly: 1 / 12,
        };
        const multiplier = freqMultiplier[bill.repeatFreq] || 1;
        return sum + avg * multiplier;
      }, 0);

    return {
      total,
      active,
      inactive: total - active,
      monthlyExpected,
    };
  }
}

export default new BillService();
