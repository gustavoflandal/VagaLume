import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateRuleGroupDTO {
  title: string;
  description?: string;
  order?: number;
}

export interface CreateRuleDTO {
  title: string;
  description?: string;
  ruleGroupId: string;
  order?: number;
  strict?: boolean;
  stopProcessing?: boolean;
  billId?: string;
}

export interface CreateRuleTriggerDTO {
  ruleId: string;
  triggerType: string;
  triggerValue: string;
  order?: number;
}

export interface CreateRuleActionDTO {
  ruleId: string;
  actionType: string;
  actionValue: string;
  order?: number;
}

class RuleService {
  /**
   * Lista todos os grupos de regras do usuário
   */
  async findAllGroups(userId: string, includeInactive = false) {
    const groups = await prisma.ruleGroup.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        rules: {
          where: includeInactive ? {} : { active: true },
          include: {
            triggers: {
              where: { active: true },
              orderBy: { order: 'asc' },
            },
            actions: {
              where: { active: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return groups;
  }

  /**
   * Busca grupo por ID
   */
  async findGroupById(groupId: string, userId: string) {
    const group = await prisma.ruleGroup.findFirst({
      where: { id: groupId, userId },
      include: {
        rules: {
          include: {
            triggers: {
              where: { active: true },
              orderBy: { order: 'asc' },
            },
            actions: {
              where: { active: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!group) {
      throw new Error('Grupo de regras não encontrado');
    }

    return group;
  }

  /**
   * Cria novo grupo de regras
   */
  async createGroup(userId: string, data: CreateRuleGroupDTO) {
    const group = await prisma.ruleGroup.create({
      data: {
        title: data.title,
        description: data.description || null,
        order: data.order ?? 0,
        userId,
      },
    });

    logger.info(`Novo grupo de regras criado: ${group.title}`);
    return group;
  }

  /**
   * Atualiza grupo
   */
  async updateGroup(groupId: string, userId: string, data: Partial<CreateRuleGroupDTO>) {
    await this.findGroupById(groupId, userId);

    const group = await prisma.ruleGroup.update({
      where: { id: groupId },
      data,
    });

    return group;
  }

  /**
   * Exclui grupo
   */
  async deleteGroup(groupId: string, userId: string) {
    await this.findGroupById(groupId, userId);

    await prisma.ruleGroup.delete({
      where: { id: groupId },
    });

    logger.info(`Grupo de regras excluído: ${groupId}`);
  }

  /**
   * Cria nova regra
   */
  async createRule(userId: string, data: CreateRuleDTO) {
    // Verifica se o grupo pertence ao usuário
    await this.findGroupById(data.ruleGroupId, userId);

    const rule = await prisma.rule.create({
      data: {
        title: data.title,
        description: data.description || null,
        ruleGroupId: data.ruleGroupId,
        order: data.order ?? 0,
        strict: data.strict ?? true,
        stopProcessing: data.stopProcessing ?? false,
        billId: data.billId || null,
        userId,
      },
    });

    logger.info(`Nova regra criada: ${rule.title}`);
    return rule;
  }

  /**
   * Busca regra por ID
   */
  async findRuleById(ruleId: string, userId: string) {
    const rule = await prisma.rule.findFirst({
      where: { id: ruleId, userId },
      include: {
        triggers: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
        actions: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
        ruleGroup: true,
        bill: true,
      },
    });

    if (!rule) {
      throw new Error('Regra não encontrada');
    }

    return rule;
  }

  /**
   * Atualiza regra
   */
  async updateRule(ruleId: string, userId: string, data: Partial<CreateRuleDTO>) {
    await this.findRuleById(ruleId, userId);

    const rule = await prisma.rule.update({
      where: { id: ruleId },
      data,
    });

    return rule;
  }

  /**
   * Exclui regra
   */
  async deleteRule(ruleId: string, userId: string) {
    await this.findRuleById(ruleId, userId);

    await prisma.rule.delete({
      where: { id: ruleId },
    });

    logger.info(`Regra excluída: ${ruleId}`);
  }

  /**
   * Adiciona trigger à regra
   */
  async addTrigger(userId: string, data: CreateRuleTriggerDTO) {
    await this.findRuleById(data.ruleId, userId);

    const trigger = await prisma.ruleTrigger.create({
      data: {
        ruleId: data.ruleId,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        order: data.order ?? 0,
      },
    });

    logger.info(`Trigger adicionado à regra ${data.ruleId}`);
    return trigger;
  }

  /**
   * Remove trigger
   */
  async removeTrigger(triggerId: string, userId: string) {
    const trigger = await prisma.ruleTrigger.findFirst({
      where: {
        id: triggerId,
        rule: { userId },
      },
    });

    if (!trigger) {
      throw new Error('Trigger não encontrado');
    }

    await prisma.ruleTrigger.delete({
      where: { id: triggerId },
    });

    logger.info(`Trigger excluído: ${triggerId}`);
  }

  /**
   * Adiciona action à regra
   */
  async addAction(userId: string, data: CreateRuleActionDTO) {
    await this.findRuleById(data.ruleId, userId);

    const action = await prisma.ruleAction.create({
      data: {
        ruleId: data.ruleId,
        actionType: data.actionType,
        actionValue: data.actionValue,
        order: data.order ?? 0,
      },
    });

    logger.info(`Action adicionada à regra ${data.ruleId}`);
    return action;
  }

  /**
   * Remove action
   */
  async removeAction(actionId: string, userId: string) {
    const action = await prisma.ruleAction.findFirst({
      where: {
        id: actionId,
        rule: { userId },
      },
    });

    if (!action) {
      throw new Error('Action não encontrada');
    }

    await prisma.ruleAction.delete({
      where: { id: actionId },
    });

    logger.info(`Action excluída: ${actionId}`);
  }

  /**
   * Testa regra contra transações
   */
  async testRule(ruleId: string, userId: string) {
    const rule = await this.findRuleById(ruleId, userId);

    // Busca transações do usuário dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      take: 100,
    });

    // Filtra transações que correspondem aos triggers
    const matches: typeof transactions = [];
    for (const transaction of transactions) {
      if (this.matchesRule(transaction, rule)) {
        matches.push(transaction);
      }
    }

    return {
      totalTransactions: transactions.length,
      matches: matches.length,
      transactions: matches.slice(0, 10), // Retorna apenas 10 exemplos
    };
  }

  /**
   * Verifica se transação corresponde à regra
   */
  private matchesRule(transaction: any, rule: any): boolean {
    const triggers = rule.triggers;

    if (triggers.length === 0) return false;

    // Modo strict: todos os triggers devem ser verdadeiros (AND)
    // Modo non-strict: qualquer trigger verdadeiro (OR)
    const checkMethod = rule.strict ? 'every' : 'some';

    return triggers[checkMethod]((trigger: any) => {
      return this.evaluateTrigger(transaction, trigger);
    });
  }

  /**
   * Avalia um trigger específico
   */
  private evaluateTrigger(transaction: any, trigger: any): boolean {
    const { triggerType, triggerValue } = trigger;

    switch (triggerType) {
      case 'description_is':
        return transaction.description.toLowerCase() === triggerValue.toLowerCase();
      case 'description_contains':
        return transaction.description.toLowerCase().includes(triggerValue.toLowerCase());
      case 'description_starts':
        return transaction.description.toLowerCase().startsWith(triggerValue.toLowerCase());
      case 'description_ends':
        return transaction.description.toLowerCase().endsWith(triggerValue.toLowerCase());
      case 'amount_more':
        return Number(transaction.amount) > Number(triggerValue);
      case 'amount_less':
        return Number(transaction.amount) < Number(triggerValue);
      case 'amount_is':
        return Number(transaction.amount) === Number(triggerValue);
      case 'category_is':
        return transaction.categoryId === triggerValue;
      case 'from_account_is':
        return transaction.fromAccountId === triggerValue;
      case 'to_account_is':
        return transaction.toAccountId === triggerValue;
      case 'has_no_category':
        return !transaction.categoryId;
      default:
        return false;
    }
  }

  /**
   * Aplica regra a uma transação
   */
  async applyRule(ruleId: string, transactionId: string, userId: string) {
    const rule = await this.findRuleById(ruleId, userId);
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    if (!this.matchesRule(transaction, rule)) {
      throw new Error('Transação não corresponde aos triggers da regra');
    }

    // Aplica todas as actions
    const updateData: any = {};

    for (const action of rule.actions) {
      const { actionType, actionValue } = action;

      switch (actionType) {
        case 'set_category':
          updateData.categoryId = actionValue;
          break;
        case 'set_description':
          updateData.description = actionValue;
          break;
        case 'append_description':
          updateData.description = `${transaction.description} ${actionValue}`;
          break;
        case 'prepend_description':
          updateData.description = `${actionValue} ${transaction.description}`;
          break;
        case 'link_to_bill':
          updateData.billId = actionValue;
          break;
        // Adicionar mais actions conforme necessário
      }
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    logger.info(`Regra ${ruleId} aplicada à transação ${transactionId}`);
    return updated;
  }
}

export default new RuleService();
