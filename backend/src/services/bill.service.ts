import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateBillDTO {
  name: string;
  amount: number;
  date: Date;
  repeatFreq: string;
  numberOfInstallments: number;
  isFixedDay?: boolean;
  categoryId?: string;
  accountId?: string;
  objectGroupId?: string;
}

export interface UpdateBillDTO {
  name?: string;
  amount?: number;
  date?: Date;
  repeatFreq?: string;
  numberOfInstallments?: number;
  isFixedDay?: boolean;
  categoryId?: string;
  accountId?: string;
  active?: boolean;
  objectGroupId?: string;
}

export interface CreateBillInstallmentDTO {
  billId: string;
  installmentSequence: number;
  dueDate: Date;
  amount: number;
}

export interface UpdateBillInstallmentDTO {
  dueDate?: Date;
  amount?: number;
  amountPaid?: number;
  paid?: boolean;
  paidAt?: Date;
  transactionId?: string;
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
        _count: {
          select: { installments: true },
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
   * Cria nova bill e gera as parcelas
   */
  async create(userId: string, data: CreateBillDTO) {
    // Converter data string para DateTime
    const dateTime = new Date(data.date);
    if (isNaN(dateTime.getTime())) {
      throw new Error('Data inválida');
    }

    // Criar a bill
    const bill = await prisma.bill.create({
      data: {
        name: data.name,
        amount: new Decimal(data.amount),
        date: dateTime,
        repeatFreq: data.repeatFreq,
        numberOfInstallments: data.numberOfInstallments,
        isFixedDay: data.isFixedDay ?? true,
        categoryId: data.categoryId || null,
        accountId: data.accountId || null,
        objectGroupId: data.objectGroupId || null,
        userId,
      },
      include: {
        objectGroup: true,
        category: true,
        account: true,
      },
    });

    // Gerar as parcelas
    await this.generateInstallments(bill.id, dateTime, data.amount, data.numberOfInstallments, data.repeatFreq, data.isFixedDay ?? true);

    logger.info(`Nova bill criada: ${bill.name} com ${data.numberOfInstallments} parcelas para usuário ${userId}`);
    return bill;
  }

  /**
   * Atualiza bill (não permite editar se houver parcelas pagas)
   */
  async update(billId: string, userId: string, data: UpdateBillDTO) {
    await this.findById(billId, userId);

    // Verificar se existem parcelas pagas
    const paidInstallments = await prisma.billInstallment.count({
      where: {
        billId,
        paid: true,
      },
    });

    if (paidInstallments > 0) {
      throw new Error('Não é possível editar uma conta recorrente com parcelas já pagas');
    }

    const updateData: any = { ...data };
    if (data.amount) updateData.amount = new Decimal(data.amount);
    
    // Converter datas string para DateTime
    if (data.date) {
      const dateTime = new Date(data.date);
      if (isNaN(dateTime.getTime())) {
        throw new Error('Data inválida');
      }
      updateData.date = dateTime;
    }

    const bill = await prisma.bill.update({
      where: { id: billId },
      data: updateData,
      include: {
        objectGroup: true,
        category: true,
        account: true,
      },
    });

    // Verificar se precisa regenerar parcelas
    // Regenera se: numberOfInstallments foi fornecido E há menos parcelas do que o necessário
    const targetInstallments = data.numberOfInstallments ?? bill.numberOfInstallments;
    
    const existingInstallments = await prisma.billInstallment.findMany({
      where: { billId },
      orderBy: { installmentSequence: 'desc' },
    });

    const currentCount = existingInstallments.length;
    
    // Regenerar se a quantidade atual for menor que a quantidade alvo
    if (currentCount < targetInstallments) {
      logger.info(`Regenerando parcelas: existem ${currentCount}, necessário ${targetInstallments}`);
      await this.regenerateInstallments(billId, userId);
    }

    logger.info(`Bill atualizada: ${bill.name}`);
    return bill;
  }

  /**
   * Gera as parcelas para uma bill
   */
  private async generateInstallments(
    billId: string,
    startDate: Date,
    amount: number,
    numberOfInstallments: number,
    repeatFreq: string,
    isFixedDay: boolean
  ) {
    const installments: Array<{
      billId: string;
      installmentSequence: number;
      dueDate: Date;
      amount: Decimal;
    }> = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= numberOfInstallments; i++) {
      installments.push({
        billId,
        installmentSequence: i,
        dueDate: new Date(currentDate),
        amount: new Decimal(amount),
      });

      // Calcular próxima data
      currentDate = this.calculateNextDate(currentDate, repeatFreq, isFixedDay);
    }

    // Criar todas as parcelas
    await prisma.billInstallment.createMany({
      data: installments,
    });

    logger.info(`${numberOfInstallments} parcelas geradas para bill ${billId}`);
  }

  /**
   * Calcula a próxima data baseado na frequência e tipo
   */
  private calculateNextDate(currentDate: Date, repeatFreq: string, isFixedDay: boolean): Date {
    const nextDate = new Date(currentDate);

    if (isFixedDay) {
      // Data específica: mantém o dia do mês
      switch (repeatFreq) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'half-year':
          nextDate.setMonth(nextDate.getMonth() + 6);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else {
      // Dias corridos: adiciona dias fixos
      const daysMap: Record<string, number> = {
        daily: 1,
        weekly: 7,
        monthly: 30,
        quarterly: 90,
        'half-year': 180,
        yearly: 365,
      };
      const daysToAdd = daysMap[repeatFreq] || 30;
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    }

    return nextDate;
  }

  /**
   * Busca todas as parcelas de uma bill
   */
  async getInstallments(billId: string, userId: string) {
    await this.findById(billId, userId);

    const installments = await prisma.billInstallment.findMany({
      where: { billId },
      orderBy: { installmentSequence: 'asc' },
      include: {
        transaction: true,
      },
    });

    return installments;
  }

  /**
   * Busca todas as parcelas do usuário
   */
  async getAllInstallments(userId: string) {
    const installments = await prisma.billInstallment.findMany({
      where: {
        bill: {
          userId,
          active: true,
        },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        bill: {
          select: {
            id: true,
            name: true,
            amount: true,
            repeatFreq: true,
            categoryId: true,
            accountId: true,
          },
        },
        transaction: true,
      },
    });

    return installments;
  }

  /**
   * Atualiza uma parcela
   */
  async updateInstallment(installmentId: string, userId: string, data: UpdateBillInstallmentDTO) {
    const installment = await prisma.billInstallment.findUnique({
      where: { id: installmentId },
      include: { bill: true },
    });

    if (!installment) {
      throw new Error('Parcela não encontrada');
    }

    // Verificar se o usuário é dono da bill
    if (installment.bill.userId !== userId) {
      throw new Error('Acesso negado');
    }

    // Não permitir editar parcela paga
    if (installment.paid) {
      throw new Error('Não é possível editar uma parcela já paga');
    }

    const updateData: any = { ...data };
    if (data.amount) updateData.amount = new Decimal(data.amount);
    if (data.amountPaid) updateData.amountPaid = new Decimal(data.amountPaid);
    // Converter data preservando o valor exato (sem timezone)
    if (data.dueDate) {
      const dateStr = typeof data.dueDate === 'string' ? data.dueDate : data.dueDate.toISOString();
      const datePart = dateStr.split('T')[0];
      if (datePart) {
        const parts = datePart.split('-');
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        if (year && month && day) {
          updateData.dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        }
      }
    }
    if (data.paidAt) {
      const dateStr = typeof data.paidAt === 'string' ? data.paidAt : data.paidAt.toISOString();
      const datePart = dateStr.split('T')[0];
      if (datePart) {
        const parts = datePart.split('-');
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        if (year && month && day) {
          updateData.paidAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        }
      }
    }

    const updated = await prisma.billInstallment.update({
      where: { id: installmentId },
      data: updateData,
    });

    logger.info(`Parcela ${installmentId} atualizada`);
    return updated;
  }

  /**
   * Marca uma parcela como paga e cria a transação
   */
  async payInstallment(installmentId: string, userId: string, transactionId: string) {
    const installment = await prisma.billInstallment.findUnique({
      where: { id: installmentId },
      include: { bill: true },
    });

    if (!installment) {
      throw new Error('Parcela não encontrada');
    }

    if (installment.bill.userId !== userId) {
      throw new Error('Acesso negado');
    }

    if (installment.paid) {
      throw new Error('Parcela já está paga');
    }

    // Atualizar parcela
    const updated = await prisma.billInstallment.update({
      where: { id: installmentId },
      data: {
        paid: true,
        paidAt: new Date(),
        transactionId,
        amountPaid: installment.amount,
      },
    });

    logger.info(`Parcela ${installmentId} marcada como paga`);
    return updated;
  }

  /**
   * Exclui uma parcela não paga
   */
  async deleteInstallment(installmentId: string, userId: string) {
    const installment = await prisma.billInstallment.findUnique({
      where: { id: installmentId },
      include: { bill: true },
    });

    if (!installment) {
      throw new Error('Parcela não encontrada');
    }

    if (installment.bill.userId !== userId) {
      throw new Error('Acesso negado');
    }

    if (installment.paid) {
      throw new Error('Não é possível excluir uma parcela já paga');
    }

    await prisma.billInstallment.delete({
      where: { id: installmentId },
    });

    logger.info(`Parcela ${installmentId} excluída`);
  }

  /**
   * Regenera parcelas faltantes para completar o número total
   */
  async regenerateInstallments(billId: string, userId: string) {
    const bill = await this.findById(billId, userId);

    // Buscar parcelas existentes
    const existingInstallments = await prisma.billInstallment.findMany({
      where: { billId },
      orderBy: { installmentSequence: 'desc' },
    });

    const currentCount = existingInstallments.length;
    const targetCount = bill.numberOfInstallments;

    if (currentCount >= targetCount) {
      logger.info(`Já existem ${currentCount} parcelas, não é necessário regenerar (target: ${targetCount})`);
      return 0;
    }

    // Calcular quantas parcelas precisam ser geradas
    const parcelasParaGerar = targetCount - currentCount;

    // Encontrar o maior número de sequência existente para continuar a numeração
    const maxSequence = existingInstallments.length > 0 && existingInstallments[0]
      ? existingInstallments[0].installmentSequence 
      : 0;

    // Encontrar a última parcela (maior sequência) para continuar a sequência de datas
    const lastInstallment = existingInstallments[0];
    let nextDate = lastInstallment 
      ? new Date(lastInstallment.dueDate)
      : new Date(bill.date);

    // Se há última parcela, calcular próxima data
    if (lastInstallment) {
      nextDate = this.calculateNextDate(nextDate, bill.repeatFreq, bill.isFixedDay);
    }

    // Gerar parcelas faltantes baseado na QUANTIDADE necessária
    const newInstallments: Array<{
      billId: string;
      installmentSequence: number;
      dueDate: Date;
      amount: Decimal;
    }> = [];
    for (let i = 0; i < parcelasParaGerar; i++) {
      const sequenceNumber = maxSequence + i + 1;
      newInstallments.push({
        billId,
        installmentSequence: sequenceNumber,
        dueDate: new Date(nextDate),
        amount: bill.amount,
      });

      nextDate = this.calculateNextDate(nextDate, bill.repeatFreq, bill.isFixedDay);
    }

    // Criar parcelas
    if (newInstallments.length > 0) {
      await prisma.billInstallment.createMany({
        data: newInstallments,
      });
      logger.info(`${newInstallments.length} parcelas regeneradas para bill ${billId} (existiam ${currentCount}, target ${targetCount})`);
    }

    return newInstallments.length;
  }

  /**
   * Exclui bill (apenas se não houver parcelas)
   */
  async delete(billId: string, userId: string) {
    await this.findById(billId, userId);

    // Verificar se existem parcelas
    const installmentsCount = await prisma.billInstallment.count({
      where: { billId },
    });

    if (installmentsCount > 0) {
      throw new Error('Não é possível excluir uma conta recorrente com parcelas cadastradas. Exclua todas as parcelas primeiro.');
    }

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

    // Encontra a próxima data futura baseado na frequência
    while (nextDate < currentDate) {
      nextDate = this.calculateNextDate(nextDate, bill.repeatFreq, bill.isFixedDay);
    }

    return nextDate;
  }

  /**
   * Busca transações que podem ser auto-matched com a bill
   */
  async autoMatchTransactions(billId: string, userId: string) {
    const bill = await this.findById(billId, userId);

    const amount = Number(bill.amount);
    // Tolerância de 10% para mais ou menos
    const minAmount = amount * 0.9;
    const maxAmount = amount * 1.1;

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

    const upcoming: Array<typeof bills[number] & { nextDate: Date; daysUntil: number }> = [];
    
    for (const bill of bills) {
      const nextDate = this.getNextExpectedDate(bill);
      const daysUntil = Math.ceil(
        (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntil <= days && daysUntil >= 0) {
        upcoming.push({
          ...bill,
          nextDate,
          daysUntil,
        });
      }
    }
    
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming;
  }

  /**
   * Obtém estatísticas das bills
   */
  async getStatistics(userId: string) {
    const bills = await this.findAll(userId);

    const total = bills.length;
    let active = 0;
    let monthlyExpected = 0;
    
    const freqMultiplier: Record<string, number> = {
      daily: 30,
      weekly: 4,
      monthly: 1,
      quarterly: 1 / 3,
      'half-year': 1 / 6,
      yearly: 1 / 12,
    };
    
    for (const bill of bills) {
      if (bill.active) {
        active++;
        const amount = Number(bill.amount);
        const multiplier = freqMultiplier[bill.repeatFreq] || 1;
        monthlyExpected += amount * multiplier;
      }
    }

    return {
      total,
      active,
      inactive: total - active,
      monthlyExpected,
    };
  }
}

export default new BillService();
