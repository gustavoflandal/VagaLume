import { PrismaClient, AccountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  balance?: number;
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  color?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

class AccountService {
  /**
   * Lista todas as contas do usuário
   */
  async findAll(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return accounts;
  }

  /**
   * Busca conta por ID
   */
  async findById(accountId: string, userId: string) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    return account;
  }

  /**
   * Cria nova conta
   */
  async create(userId: string, data: CreateAccountDTO) {
    const account = await prisma.account.create({
      data: {
        ...data,
        balance: data.balance ? new Decimal(data.balance) : new Decimal(0),
        userId,
      },
    });

    logger.info(`Nova conta criada: ${account.name} para usuário ${userId}`);
    return account;
  }

  /**
   * Atualiza conta
   */
  async update(accountId: string, userId: string, data: UpdateAccountDTO) {
    // Verificar se a conta pertence ao usuário
    await this.findById(accountId, userId);

    const account = await prisma.account.update({
      where: { id: accountId },
      data,
    });

    logger.info(`Conta atualizada: ${account.name}`);
    return account;
  }

  /**
   * Exclui conta (soft delete)
   */
  async delete(accountId: string, userId: string) {
    // Verificar se a conta pertence ao usuário
    await this.findById(accountId, userId);

    // Verificar se há transações associadas
    const transactionsCount = await prisma.transaction.count({
      where: {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
    });

    if (transactionsCount > 0) {
      // Se houver transações, apenas desativar
      await prisma.account.update({
        where: { id: accountId },
        data: { isActive: false },
      });
      logger.info(`Conta desativada (tem transações): ${accountId}`);
    } else {
      // Se não houver transações, excluir permanentemente
      await prisma.account.delete({
        where: { id: accountId },
      });
      logger.info(`Conta excluída: ${accountId}`);
    }
  }

  /**
   * Calcula resumo das contas (total por tipo)
   */
  async getSummary(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
    });

    const summary = accounts.reduce(
      (acc, account) => {
        const balance = Number(account.balance);
        acc.total += balance;
        acc.byType[account.type] = (acc.byType[account.type] || 0) + balance;
        return acc;
      },
      { total: 0, byType: {} as Record<string, number> }
    );

    return summary;
  }
}

export default new AccountService();
