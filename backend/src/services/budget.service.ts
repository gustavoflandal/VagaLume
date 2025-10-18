import { AutoBudgetType, AutoBudgetPeriod, BudgetType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateBudgetDTO {
  name: string;
  type?: BudgetType;
  order?: number;
}

export interface UpdateBudgetDTO {
  name?: string;
  active?: boolean;
  order?: number;
}

export interface CreateBudgetLimitDTO {
  budgetId: string;
  categoryId?: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  currency?: string;
}

export interface CreateAutoBudgetDTO {
  budgetId: string;
  type: AutoBudgetType;
  amount: number;
  period: AutoBudgetPeriod;
  currency?: string;
}

class BudgetService {
  /**
   * Lista todos os budgets do usuário
   */
  async findAll(userId: string, includeInactive = false) {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        limits: {
          include: {
            category: true,
          },
          orderBy: { startDate: 'desc' },
        },
        autoBudget: true,
        notes: true,
        attachments: true,
      },
      orderBy: { order: 'asc' },
    });

    return budgets;
  }

  /**
   * Busca budget por ID
   */
  async findById(budgetId: string, userId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
      include: {
        limits: {
          orderBy: { startDate: 'desc' },
        },
        autoBudget: true,
        notes: true,
        attachments: true,
      },
    });

    if (!budget) {
      throw new Error('Budget não encontrado');
    }

    return budget;
  }

  /**
   * Cria novo budget
   */
  async create(userId: string, data: CreateBudgetDTO) {
    const budget = await prisma.budget.create({
      data: {
        name: data.name,
        type: data.type || BudgetType.GENERAL,
        order: data.order ?? 0,
        userId,
      },
    });

    logger.info(`Novo budget criado: ${budget.name} para usuário ${userId}`);
    return budget;
  }

  /**
   * Atualiza budget
   */
  async update(budgetId: string, userId: string, data: UpdateBudgetDTO) {
    await this.findById(budgetId, userId);

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data,
    });

    logger.info(`Budget atualizado: ${budget.name}`);
    return budget;
  }

  /**
   * Exclui budget
   */
  async delete(budgetId: string, userId: string) {
    await this.findById(budgetId, userId);

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    logger.info(`Budget excluído: ${budgetId}`);
  }

  /**
   * Cria limite para budget
   */
  async createLimit(userId: string, data: CreateBudgetLimitDTO) {
    try {
      logger.info('[createLimit] Iniciando criação de limite:', data);
      
      // Verifica se o budget pertence ao usuário
      const budget = await this.findById(data.budgetId, userId);
      logger.info('[createLimit] Budget encontrado:', { id: budget.id, type: budget.type });

      // Validações baseadas no tipo de orçamento
      if (budget.type === BudgetType.CATEGORY && !data.categoryId) {
        logger.error('[createLimit] Erro: Categoria obrigatória para orçamento por categoria');
        throw new Error('Categoria é obrigatória para orçamento por categoria');
      }

      if (budget.type === BudgetType.GENERAL && data.categoryId) {
        logger.error('[createLimit] Erro: Orçamento geral não pode ter categoria');
        throw new Error('Orçamento geral não pode ter categoria específica');
      }

      logger.info('[createLimit] Validações OK, criando limite no banco...');
      
      const limit = await prisma.budgetLimit.create({
        data: {
          budgetId: data.budgetId,
          categoryId: data.categoryId || null,
          amount: new Decimal(data.amount),
          startDate: data.startDate,
          endDate: data.endDate,
          currency: data.currency ?? 'BRL',
        },
        include: {
          category: true,
        },
      });

      logger.info(`[createLimit] Limite criado com sucesso: ${limit.id}`);
      return limit;
    } catch (error) {
      logger.error('[createLimit] Erro ao criar limite:', error);
      throw error;
    }
  }

  /**
   * Atualiza limite
   */
  async updateLimit(limitId: string, userId: string, data: Partial<CreateBudgetLimitDTO>) {
    const limit = await prisma.budgetLimit.findFirst({
      where: {
        id: limitId,
        budget: { userId },
      },
    });

    if (!limit) {
      throw new Error('Limite não encontrado');
    }

    const updateData: any = { ...data };
    if (data.amount) updateData.amount = new Decimal(data.amount);

    const updated = await prisma.budgetLimit.update({
      where: { id: limitId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Exclui limite
   */
  async deleteLimit(limitId: string, userId: string) {
    const limit = await prisma.budgetLimit.findFirst({
      where: {
        id: limitId,
        budget: { userId },
      },
    });

    if (!limit) {
      throw new Error('Limite não encontrado');
    }

    await prisma.budgetLimit.delete({
      where: { id: limitId },
    });

    logger.info(`Limite excluído: ${limitId}`);
  }

  /**
   * Cria ou atualiza auto-budget
   */
  async setAutoBudget(userId: string, data: CreateAutoBudgetDTO) {
    // Verifica se o budget pertence ao usuário
    await this.findById(data.budgetId, userId);

    // Verifica se já existe auto-budget
    const existing = await prisma.autoBudget.findUnique({
      where: { budgetId: data.budgetId },
    });

    let autoBudget;

    if (existing) {
      autoBudget = await prisma.autoBudget.update({
        where: { budgetId: data.budgetId },
        data: {
          type: data.type,
          amount: new Decimal(data.amount),
          period: data.period,
          currency: data.currency ?? 'BRL',
        },
      });
      logger.info(`Auto-budget atualizado para budget ${data.budgetId}`);
    } else {
      autoBudget = await prisma.autoBudget.create({
        data: {
          budgetId: data.budgetId,
          type: data.type,
          amount: new Decimal(data.amount),
          period: data.period,
          currency: data.currency ?? 'BRL',
        },
      });
      logger.info(`Auto-budget criado para budget ${data.budgetId}`);
    }

    return autoBudget;
  }

  /**
   * Remove auto-budget
   */
  async removeAutoBudget(budgetId: string, userId: string) {
    await this.findById(budgetId, userId);

    await prisma.autoBudget.delete({
      where: { budgetId },
    });

    logger.info(`Auto-budget removido do budget ${budgetId}`);
  }

  /**
   * Obtém gastos atuais do budget em um período
   */
  async getCurrentSpending(budgetId: string, userId: string, startDate: Date, endDate: Date) {
    await this.findById(budgetId, userId);

    // Busca todas as categorias do budget (assumindo que haverá um relacionamento)
    // Por enquanto, vamos somar todas as transações do usuário no período
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: 'EXPENSE',
      },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return { total, transactions: transactions.length };
  }

  /**
   * Verifica se budget ultrapassou o limite
   */
  async checkExceeded(budgetId: string, userId: string) {
    const budget = await this.findById(budgetId, userId);

    // Busca limite atual
    const now = new Date();
    const currentLimit = budget.limits.find(
      (l) => new Date(l.startDate) <= now && new Date(l.endDate) >= now
    );

    if (!currentLimit) {
      return { exceeded: false, message: 'Nenhum limite ativo' };
    }

    const { total } = await this.getCurrentSpending(
      budgetId,
      userId,
      new Date(currentLimit.startDate),
      new Date(currentLimit.endDate)
    );

    const limitAmount = Number(currentLimit.amount);
    const exceeded = total > limitAmount;
    const percentage = (total / limitAmount) * 100;

    return {
      exceeded,
      percentage,
      spent: total,
      limit: limitAmount,
      remaining: limitAmount - total,
    };
  }
}

export default new BudgetService();
