import { TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTransactionDTO {
  description?: string;
  amount?: number;
  type?: TransactionType;
  date?: Date;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
  attachments?: string[];
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  categoryId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

class TransactionService {
  /**
   * Lista transações com filtros
   */
  async findAll(userId: string, filters?: TransactionFilters, page = 1, limit = 50) {
    const where: any = { userId };

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.accountId) {
        where.OR = [{ fromAccountId: filters.accountId }, { toAccountId: filters.accountId }];
      }
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }
      if (filters.minAmount || filters.maxAmount) {
        where.amount = {};
        if (filters.minAmount) where.amount.gte = new Decimal(filters.minAmount);
        if (filters.maxAmount) where.amount.lte = new Decimal(filters.maxAmount);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          fromAccount: { select: { id: true, name: true, type: true } },
          toAccount: { select: { id: true, name: true, type: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca transação por ID
   */
  async findById(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        category: true,
        fromAccount: true,
        toAccount: true,
      },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    return transaction;
  }

  /**
   * Cria nova transação
   */
  async create(userId: string, data: CreateTransactionDTO) {
    // Validações
    if (data.type === 'TRANSFER') {
      if (!data.fromAccountId || !data.toAccountId) {
        throw new Error('Transferências requerem conta de origem e destino');
      }
      if (data.fromAccountId === data.toAccountId) {
        throw new Error('Contas de origem e destino devem ser diferentes');
      }
    } else if (data.type === 'EXPENSE' && !data.fromAccountId) {
      throw new Error('Despesas requerem conta de origem');
    } else if (data.type === 'INCOME' && !data.toAccountId) {
      throw new Error('Receitas requerem conta de destino');
    }

    // Verificar se as contas pertencem ao usuário
    if (data.fromAccountId) {
      const account = await prisma.account.findFirst({
        where: { id: data.fromAccountId, userId },
      });
      if (!account) throw new Error('Conta de origem não encontrada');
    }

    if (data.toAccountId) {
      const account = await prisma.account.findFirst({
        where: { id: data.toAccountId, userId },
      });
      if (!account) throw new Error('Conta de destino não encontrada');
    }

    // Verificar se a categoria pertence ao usuário (se fornecida)
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId },
      });
      if (!category) throw new Error('Categoria não encontrada');
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: new Decimal(data.amount),
        type: data.type,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        ...(data.fromAccountId && { fromAccountId: data.fromAccountId }),
        ...(data.toAccountId && { toAccountId: data.toAccountId }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        status: data.status || 'COMPLETED',
        userId,
      },
      include: {
        category: true,
        fromAccount: true,
        toAccount: true,
      },
    });

    // Atualizar saldos das contas se a transação estiver completa
    if (transaction.status === 'COMPLETED') {
      await this.updateAccountBalances(transaction);
    }

    logger.info(`Nova transação criada: ${transaction.description} para usuário ${userId}`);
    return transaction;
  }

  /**
   * Atualiza transação
   */
  async update(transactionId: string, userId: string, data: UpdateTransactionDTO) {
    const oldTransaction = await this.findById(transactionId, userId);

    // Validações similares ao create
    if (data.type === 'TRANSFER') {
      const fromAccountId = data.fromAccountId || oldTransaction.fromAccountId;
      const toAccountId = data.toAccountId || oldTransaction.toAccountId;
      
      if (!fromAccountId || !toAccountId) {
        throw new Error('Transferências requerem conta de origem e destino');
      }
      if (fromAccountId === toAccountId) {
        throw new Error('Contas de origem e destino devem ser diferentes');
      }
    }

    // Reverter saldos antigos se a transação estava completa
    if (oldTransaction.status === 'COMPLETED') {
      await this.reverseAccountBalances(oldTransaction);
    }

    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.date !== undefined) updateData.date = data.date instanceof Date ? data.date : new Date(data.date);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.fromAccountId !== undefined) updateData.fromAccountId = data.fromAccountId;
    if (data.toAccountId !== undefined) updateData.toAccountId = data.toAccountId;

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        category: true,
        fromAccount: true,
        toAccount: true,
      },
    });

    // Aplicar novos saldos se a transação estiver completa
    if (transaction.status === 'COMPLETED') {
      await this.updateAccountBalances(transaction);
    }

    logger.info(`Transação atualizada: ${transaction.description}`);
    return transaction;
  }

  /**
   * Exclui transação
   */
  async delete(transactionId: string, userId: string) {
    const transaction = await this.findById(transactionId, userId);

    // Reverter saldos se a transação estava completa
    if (transaction.status === 'COMPLETED') {
      await this.reverseAccountBalances(transaction);
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    logger.info(`Transação excluída: ${transactionId}`);
  }

  /**
   * Atualiza os saldos das contas baseado na transação
   */
  private async updateAccountBalances(transaction: any) {
    if (transaction.fromAccountId) {
      await prisma.account.update({
        where: { id: transaction.fromAccountId },
        data: { balance: { decrement: transaction.amount } },
      });
    }

    if (transaction.toAccountId) {
      await prisma.account.update({
        where: { id: transaction.toAccountId },
        data: { balance: { increment: transaction.amount } },
      });
    }
  }

  /**
   * Reverte os saldos das contas baseado na transação
   */
  private async reverseAccountBalances(transaction: any) {
    if (transaction.fromAccountId) {
      await prisma.account.update({
        where: { id: transaction.fromAccountId },
        data: { balance: { increment: transaction.amount } },
      });
    }

    if (transaction.toAccountId) {
      await prisma.account.update({
        where: { id: transaction.toAccountId },
        data: { balance: { decrement: transaction.amount } },
      });
    }
  }

  /**
   * Calcula resumo financeiro do usuário
   */
  async getSummary(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId, status: 'COMPLETED' };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [income, expense, transfers] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'TRANSFER' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);
    const totalTransfers = Number(transfers._sum.amount || 0);

    return {
      income: {
        total: totalIncome,
        count: income._count,
      },
      expense: {
        total: totalExpense,
        count: expense._count,
      },
      transfers: {
        total: totalTransfers,
        count: transfers._count,
      },
      balance: totalIncome - totalExpense,
    };
  }
}

export default new TransactionService();
