import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreatePiggyBankDTO {
  name: string;
  targetAmount: number;
  startDate?: Date;
  targetDate?: Date;
  accountId?: string;
  objectGroupId?: string;
  order?: number;
}

export interface UpdatePiggyBankDTO {
  name?: string;
  targetAmount?: number;
  startDate?: Date;
  targetDate?: Date;
  accountId?: string;
  objectGroupId?: string;
  order?: number;
  active?: boolean;
}

export interface AddMoneyDTO {
  amount: number;
  transactionId?: string;
  date?: Date;
}

class PiggyBankService {
  /**
   * Lista todos os cofrinhos do usuário
   */
  async findAll(userId: string, includeInactive = false) {
    const piggyBanks = await prisma.piggyBank.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        account: true,
        objectGroup: true,
        events: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { order: 'asc' },
    });

    return piggyBanks.map((pb) => ({
      ...pb,
      progress: this.calculateProgress(
        Number(pb.currentAmount),
        Number(pb.targetAmount)
      ),
    }));
  }

  /**
   * Busca cofrinho por ID
   */
  async findById(piggyBankId: string, userId: string) {
    const piggyBank = await prisma.piggyBank.findFirst({
      where: { id: piggyBankId, userId },
      include: {
        account: true,
        objectGroup: true,
        events: {
          orderBy: { date: 'desc' },
          include: {
            transaction: true,
          },
        },
      },
    });

    if (!piggyBank) {
      throw new Error('Cofrinho não encontrado');
    }

    return {
      ...piggyBank,
      progress: this.calculateProgress(
        Number(piggyBank.currentAmount),
        Number(piggyBank.targetAmount)
      ),
    };
  }

  /**
   * Cria novo cofrinho
   */
  async create(userId: string, data: CreatePiggyBankDTO) {
    const piggyBank = await prisma.piggyBank.create({
      data: {
        name: data.name,
        targetAmount: new Decimal(data.targetAmount),
        currentAmount: new Decimal(0),
        startDate: data.startDate || null,
        targetDate: data.targetDate || null,
        accountId: data.accountId || null,
        objectGroupId: data.objectGroupId || null,
        order: data.order ?? 0,
        userId,
      },
      include: {
        account: true,
        objectGroup: true,
      },
    });

    logger.info(`Novo cofrinho criado: ${piggyBank.name} para usuário ${userId}`);
    return piggyBank;
  }

  /**
   * Atualiza cofrinho
   */
  async update(piggyBankId: string, userId: string, data: UpdatePiggyBankDTO) {
    await this.findById(piggyBankId, userId);

    const updateData: any = { ...data };
    if (data.targetAmount) {
      updateData.targetAmount = new Decimal(data.targetAmount);
    }

    const piggyBank = await prisma.piggyBank.update({
      where: { id: piggyBankId },
      data: updateData,
      include: {
        account: true,
        objectGroup: true,
      },
    });

    logger.info(`Cofrinho atualizado: ${piggyBank.name}`);
    return piggyBank;
  }

  /**
   * Exclui cofrinho
   */
  async delete(piggyBankId: string, userId: string) {
    await this.findById(piggyBankId, userId);

    await prisma.piggyBank.delete({
      where: { id: piggyBankId },
    });

    logger.info(`Cofrinho excluído: ${piggyBankId}`);
  }

  /**
   * Adiciona dinheiro ao cofrinho
   */
  async addMoney(piggyBankId: string, userId: string, data: AddMoneyDTO) {
    const piggyBank = await this.findById(piggyBankId, userId);

    const newAmount = Number(piggyBank.currentAmount) + data.amount;
    const targetAmount = Number(piggyBank.targetAmount);

    if (newAmount > targetAmount) {
      throw new Error(
        `Valor ultrapassa a meta! Máximo permitido: R$ ${(targetAmount - Number(piggyBank.currentAmount)).toFixed(2)}`
      );
    }

    // Atualiza o valor atual
    const updatedPiggyBank = await prisma.piggyBank.update({
      where: { id: piggyBankId },
      data: {
        currentAmount: new Decimal(newAmount),
      },
    });

    // Registra o evento
    const event = await prisma.piggyBankEvent.create({
      data: {
        piggyBankId,
        amount: new Decimal(data.amount),
        date: data.date || new Date(),
        transactionId: data.transactionId || null,
      },
    });

    logger.info(
      `Adicionado R$ ${data.amount} ao cofrinho ${piggyBank.name}. Total: R$ ${newAmount}`
    );

    return { piggyBank: updatedPiggyBank, event };
  }

  /**
   * Remove dinheiro do cofrinho
   */
  async removeMoney(piggyBankId: string, userId: string, data: AddMoneyDTO) {
    const piggyBank = await this.findById(piggyBankId, userId);

    const newAmount = Number(piggyBank.currentAmount) - data.amount;

    if (newAmount < 0) {
      throw new Error(
        `Valor insuficiente! Disponível: R$ ${Number(piggyBank.currentAmount).toFixed(2)}`
      );
    }

    // Atualiza o valor atual
    const updatedPiggyBank = await prisma.piggyBank.update({
      where: { id: piggyBankId },
      data: {
        currentAmount: new Decimal(newAmount),
      },
    });

    // Registra o evento (valor negativo)
    const event = await prisma.piggyBankEvent.create({
      data: {
        piggyBankId,
        amount: new Decimal(-data.amount),
        date: data.date || new Date(),
        transactionId: data.transactionId || null,
      },
    });

    logger.info(
      `Removido R$ ${data.amount} do cofrinho ${piggyBank.name}. Restante: R$ ${newAmount}`
    );

    return { piggyBank: updatedPiggyBank, event };
  }

  /**
   * Calcula progresso do cofrinho
   */
  private calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  }

  /**
   * Obtém estatísticas dos cofrinhos
   */
  async getStatistics(userId: string) {
    const piggyBanks = await prisma.piggyBank.findMany({
      where: { userId, active: true },
    });

    const total = piggyBanks.length;
    const completed = piggyBanks.filter(
      (pb) => Number(pb.currentAmount) >= Number(pb.targetAmount)
    ).length;
    const totalSaved = piggyBanks.reduce(
      (sum, pb) => sum + Number(pb.currentAmount),
      0
    );
    const totalTarget = piggyBanks.reduce(
      (sum, pb) => sum + Number(pb.targetAmount),
      0
    );

    return {
      total,
      completed,
      inProgress: total - completed,
      totalSaved,
      totalTarget,
      progress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  }
}

export default new PiggyBankService();
