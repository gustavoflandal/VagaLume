import {
  Prisma,
  RecurrenceRepetition,
  RecurrenceRepetitionType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

type RecurrenceWithRelations = Prisma.RecurrenceGetPayload<{
  include: {
    repetitions_config: true;
    recurrenceTransactions: {
      include: {
        meta: true;
      };
    };
    transactions: true;
    notes: true;
    attachments: true;
  };
}>;

export interface CreateRecurrenceDTO {
  title: string;
  description?: string;
  firstDate: Date;
  repeatUntil?: Date;
  repetitions?: number;
  applyRules?: boolean;
  repetitionType: RecurrenceRepetitionType;
  repetitionMoment: string;
  repetitionSkip?: number;
  repetitionWeekend?: number;
  transactionData: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    fromAccountId: string;
    toAccountId: string;
    categoryId?: string;
    budgetId?: string;
    billId?: string;
    foreignAmount?: number;
    foreignCurrency?: string;
  };
}

class RecurrenceService {
  /**
   * Lista todas as recorrências do usuário
   */
  async findAll(userId: string, includeInactive = false) {
    const recurrences = await prisma.recurrence.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        repetitions_config: true,
        recurrenceTransactions: {
          include: {
            meta: true,
          },
        },
        transactions: true,
        notes: true,
        attachments: true,
      },
      orderBy: { firstDate: 'desc' },
    });

    return recurrences;
  }

  /**
   * Busca recorrência por ID
   */
  async findById(recurrenceId: string, userId: string) {
    const recurrence = await prisma.recurrence.findFirst({
      where: { id: recurrenceId, userId },
      include: {
        repetitions_config: true,
        recurrenceTransactions: {
          include: {
            meta: true,
          },
        },
        transactions: true,
        notes: true,
        attachments: true,
      },
    });

    if (!recurrence) {
      throw new Error('Recorrência não encontrada');
    }

    return recurrence;
  }

  /**
   * Cria nova recorrência
   */
  async create(userId: string, data: CreateRecurrenceDTO) {
    const recurrence = await prisma.recurrence.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        firstDate: data.firstDate,
        repeatUntil: data.repeatUntil ?? null,
        repetitions: data.repetitions ?? null,
        applyRules: data.applyRules ?? true,
        userId,
        repetitions_config: {
          create: {
            type: data.repetitionType,
            moment: data.repetitionMoment,
            skip: data.repetitionSkip ?? 0,
            weekend: data.repetitionWeekend ?? 1,
          },
        },
        recurrenceTransactions: {
          create: {
            description: data.transactionData.description,
            amount: new Decimal(data.transactionData.amount),
            type: data.transactionData.type as TransactionType,
            fromAccountId: data.transactionData.fromAccountId,
            toAccountId: data.transactionData.toAccountId,
            ...(data.transactionData.categoryId
              ? { categoryId: data.transactionData.categoryId }
              : {}),
            ...(data.transactionData.billId ? { billId: data.transactionData.billId } : {}),
            ...(data.transactionData.budgetId
              ? { budgetId: data.transactionData.budgetId }
              : {}),
            ...(data.transactionData.foreignAmount !== undefined
              ? { foreignAmount: new Decimal(data.transactionData.foreignAmount) }
              : {}),
            ...(data.transactionData.foreignCurrency
              ? { foreignCurrency: data.transactionData.foreignCurrency }
              : {}),
          },
        },
      },
      include: {
        repetitions_config: true,
        recurrenceTransactions: {
          include: {
            meta: true,
          },
        },
        transactions: true,
      },
    });

    logger.info(`Nova recorrência criada: ${recurrence.title} para usuário ${userId}`);
    return recurrence;
  }

  /**
   * Atualiza recorrência
   */
  async update(recurrenceId: string, userId: string, data: Partial<CreateRecurrenceDTO>) {
    await this.findById(recurrenceId, userId);

    const updateData: Prisma.RecurrenceUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description ?? null;
    }

    if (data.firstDate !== undefined) {
      updateData.firstDate = data.firstDate;
    }

    if (data.repeatUntil !== undefined) {
      updateData.repeatUntil = data.repeatUntil ?? null;
    }

    if (data.repetitions !== undefined) {
      updateData.repetitions = data.repetitions ?? null;
    }

    if (data.applyRules !== undefined) {
      updateData.applyRules = data.applyRules;
    }

    if (
      data.repetitionType !== undefined ||
      data.repetitionMoment !== undefined ||
      data.repetitionSkip !== undefined ||
      data.repetitionWeekend !== undefined
    ) {
      const repetitionUpdate: Prisma.RecurrenceRepetitionUpdateManyMutationInput = {};

      if (data.repetitionType !== undefined) {
        repetitionUpdate.type = data.repetitionType;
      }

      if (data.repetitionMoment !== undefined) {
        repetitionUpdate.moment = data.repetitionMoment;
      }

      if (data.repetitionSkip !== undefined) {
        repetitionUpdate.skip = data.repetitionSkip;
      }

      if (data.repetitionWeekend !== undefined) {
        repetitionUpdate.weekend = data.repetitionWeekend;
      }

      updateData.repetitions_config = {
        updateMany: {
          where: {},
          data: repetitionUpdate,
        },
      };
    }

    const recurrence = await prisma.recurrence.update({
      where: { id: recurrenceId },
      data: updateData,
      include: {
        repetitions_config: true,
        recurrenceTransactions: {
          include: {
            meta: true,
          },
        },
        transactions: true,
      },
    });

    logger.info(`Recorrência atualizada: ${recurrence.title}`);
    return recurrence;
  }

  /**
   * Exclui recorrência
   */
  async delete(recurrenceId: string, userId: string) {
    await this.findById(recurrenceId, userId);

    await prisma.recurrence.delete({
      where: { id: recurrenceId },
    });

    logger.info(`Recorrência excluída: ${recurrenceId}`);
  }

  /**
   * Calcula próximas ocorrências da recorrência
   */
  async getNextOccurrences(recurrenceId: string, userId: string, count = 5) {
    const recurrence = await this.findById(recurrenceId, userId);
    const repetition = recurrence.repetitions_config[0];

    if (!repetition) {
      throw new Error('Recorrência sem repetição configurada');
    }

    const occurrences: Date[] = [];
    let currentDate = new Date(recurrence.firstDate);
    const today = new Date();

    // Avança até uma data futura
    while (currentDate <= today) {
      currentDate = this.calculateNextDate(currentDate, repetition);
    }

    // Gera as próximas N ocorrências
    for (let i = 0; i < count; i++) {
      occurrences.push(new Date(currentDate));
      currentDate = this.calculateNextDate(currentDate, repetition);

      // Para se chegou ao limite de repetições
      if (
        recurrence.repeatUntil &&
        currentDate > new Date(recurrence.repeatUntil)
      ) {
        break;
      }
    }

    return occurrences;
  }

  /**
   * Calcula próxima data baseado no tipo de repetição
   */
  private calculateNextDate(date: Date, repetition: RecurrenceRepetition): Date {
    const nextDate = new Date(date);
    const skip = repetition.skip + 1;

    switch (repetition.type) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + skip);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7 * skip);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + skip);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3 * skip);
        break;
      case 'HALF_YEAR':
        nextDate.setMonth(nextDate.getMonth() + 6 * skip);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + skip);
        break;
    }

    // Trata finais de semana
    return this.handleWeekend(nextDate, repetition.weekend);
  }

  /**
   * Trata datas que caem em finais de semana
   */
  private handleWeekend(date: Date, weekendBehavior: number): Date {
    const dayOfWeek = date.getDay();

    // 0 = Domingo, 6 = Sábado
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      switch (weekendBehavior) {
        case 1: // Ignorar - manter a data
          return date;
        case 2: // Mover para segunda-feira
          const daysToAdd = dayOfWeek === 0 ? 1 : 2;
          date.setDate(date.getDate() + daysToAdd);
          break;
        case 3: // Mover para sexta-feira anterior
          const daysToSubtract = dayOfWeek === 0 ? 2 : 1;
          date.setDate(date.getDate() - daysToSubtract);
          break;
        case 4: // Pular essa ocorrência
          // Implementar lógica de pular
          break;
      }
    }

    return date;
  }

  /**
   * Gera transações para recorrências ativas
   */
  async generateTransactions(targetDate?: Date) {
    const date = targetDate || new Date();

    const recurrences = await prisma.recurrence.findMany({
      where: {
        active: true,
        OR: [{ repeatUntil: null }, { repeatUntil: { gte: date } }],
      },
      include: {
        repetitions_config: true,
        recurrenceTransactions: {
          include: {
            meta: true,
          },
        },
        transactions: true,
        notes: true,
        attachments: true,
      },
    });

    let generatedCount = 0;

    for (const recurrence of recurrences) {
      const shouldGenerate = await this.shouldGenerateTransaction(recurrence, date);

      if (shouldGenerate) {
        const generated = await this.generateSingleTransaction(recurrence, date);

        if (generated) {
          generatedCount++;
        }
      }
    }

    logger.info(`Geradas ${generatedCount} transações recorrentes`);
    return { generated: generatedCount };
  }

  /**
   * Verifica se deve gerar transação para a data
   */
  private async shouldGenerateTransaction(
    recurrence: RecurrenceWithRelations,
    date: Date
  ): Promise<boolean> {
    // Busca última transação gerada
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        recurrenceId: recurrence.id,
      },
      orderBy: { date: 'desc' },
    });

    if (!lastTransaction) {
      // Primeira transação - verificar se a data inicial já passou
      return new Date(recurrence.firstDate) <= date;
    }

    // Calcular próxima data esperada
    const repetition = recurrence.repetitions_config[0];

    if (!repetition) {
      return false;
    }

    const nextExpectedDate = this.calculateNextDate(
      new Date(lastTransaction.date),
      repetition
    );

    // Gerar se a próxima data esperada já passou
    return nextExpectedDate <= date;
  }

  /**
   * Gera uma única transação da recorrência
   */
  private async generateSingleTransaction(
    recurrence: RecurrenceWithRelations,
    date: Date
  ): Promise<Transaction | null> {
    const template = recurrence.recurrenceTransactions[0];

    if (!template) {
      logger.warn(`Recorrência ${recurrence.id} sem template de transação para geração.`);
      return null;
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: template.description,
        amount: template.amount,
        type: template.type,
        date,
        fromAccountId: template.fromAccountId,
        toAccountId: template.toAccountId,
        ...(template.categoryId ? { categoryId: template.categoryId } : {}),
        ...(template.billId ? { billId: template.billId } : {}),
        ...(template.foreignAmount ? { foreignAmount: template.foreignAmount } : {}),
        ...(template.foreignCurrency ? { foreignCurrency: template.foreignCurrency } : {}),
        userId: recurrence.userId,
        recurrenceId: recurrence.id,
        status: TransactionStatus.COMPLETED,
      },
    });

    // Atualizar latestDate da recorrência
    await prisma.recurrence.update({
      where: { id: recurrence.id },
      data: { latestDate: date },
    });

    logger.info(
      `Transação recorrente gerada: ${transaction.description} - R$ ${transaction.amount}`
    );

    return transaction;
  }
}

export default new RecurrenceService();
