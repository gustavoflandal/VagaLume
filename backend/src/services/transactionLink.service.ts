import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateLinkTypeDTO {
  name: string;
  inward: string;
  outward: string;
  editable?: boolean;
}

export interface CreateTransactionLinkDTO {
  linkTypeId: string;
  fromTransactionId: string;
  toTransactionId: string;
  notes?: string;
}

class TransactionLinkService {
  /**
   * Lista todos os tipos de link
   */
  async findAllTypes() {
    const linkTypes = await prisma.linkType.findMany({
      orderBy: { name: 'asc' },
    });

    return linkTypes;
  }

  /**
   * Busca tipo de link por ID
   */
  async findTypeById(linkTypeId: string) {
    const linkType = await prisma.linkType.findUnique({
      where: { id: linkTypeId },
    });

    if (!linkType) {
      throw new Error('Tipo de link não encontrado');
    }

    return linkType;
  }

  /**
   * Cria novo tipo de link
   */
  async createType(data: CreateLinkTypeDTO) {
    const linkType = await prisma.linkType.create({
      data: {
        name: data.name,
        inward: data.inward,
        outward: data.outward,
        editable: data.editable ?? true,
      },
    });

    logger.info(`Novo tipo de link criado: ${linkType.name}`);
    return linkType;
  }

  /**
   * Atualiza tipo de link
   */
  async updateType(linkTypeId: string, data: Partial<CreateLinkTypeDTO>) {
    const linkType = await this.findTypeById(linkTypeId);

    if (!linkType.editable) {
      throw new Error('Este tipo de link não pode ser editado');
    }

    const updated = await prisma.linkType.update({
      where: { id: linkTypeId },
      data,
    });

    logger.info(`Tipo de link atualizado: ${updated.name}`);
    return updated;
  }

  /**
   * Exclui tipo de link
   */
  async deleteType(linkTypeId: string) {
    const linkType = await this.findTypeById(linkTypeId);

    if (!linkType.editable) {
      throw new Error('Este tipo de link não pode ser excluído');
    }

    await prisma.linkType.delete({
      where: { id: linkTypeId },
    });

    logger.info(`Tipo de link excluído: ${linkTypeId}`);
  }

  /**
   * Lista todos os links de uma transação
   */
  async findByTransaction(transactionId: string, userId: string) {
    // Verifica se a transação pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    const links = await prisma.transactionLink.findMany({
      where: {
        OR: [{ fromTransactionId: transactionId }, { toTransactionId: transactionId }],
      },
      include: {
        linkType: true,
        fromTransaction: true,
        toTransaction: true,
      },
    });

    return links;
  }

  /**
   * Cria link entre transações
   */
  async create(userId: string, data: CreateTransactionLinkDTO) {
    // Verifica se ambas as transações pertencem ao usuário
    const [fromTransaction, toTransaction] = await Promise.all([
      prisma.transaction.findFirst({
        where: { id: data.fromTransactionId, userId },
      }),
      prisma.transaction.findFirst({
        where: { id: data.toTransactionId, userId },
      }),
    ]);

    if (!fromTransaction || !toTransaction) {
      throw new Error('Uma ou ambas as transações não foram encontradas');
    }

    // Verifica se já existe link
    const existing = await prisma.transactionLink.findFirst({
      where: {
        fromTransactionId: data.fromTransactionId,
        toTransactionId: data.toTransactionId,
        linkTypeId: data.linkTypeId,
      },
    });

    if (existing) {
      throw new Error('Link já existe entre essas transações');
    }

    const link = await prisma.transactionLink.create({
      data: {
        linkTypeId: data.linkTypeId,
        fromTransactionId: data.fromTransactionId,
        toTransactionId: data.toTransactionId,
        notes: data.notes || null,
      },
      include: {
        linkType: true,
        fromTransaction: true,
        toTransaction: true,
      },
    });

    logger.info(
      `Link criado entre transações ${data.fromTransactionId} e ${data.toTransactionId}`
    );
    return link;
  }

  /**
   * Atualiza link
   */
  async update(linkId: string, userId: string, data: { notes?: string }) {
    const link = await prisma.transactionLink.findFirst({
      where: {
        id: linkId,
        fromTransaction: { userId },
      },
    });

    if (!link) {
      throw new Error('Link não encontrado');
    }

    const updated = await prisma.transactionLink.update({
      where: { id: linkId },
      data,
      include: {
        linkType: true,
        fromTransaction: true,
        toTransaction: true,
      },
    });

    logger.info(`Link atualizado: ${linkId}`);
    return updated;
  }

  /**
   * Exclui link
   */
  async delete(linkId: string, userId: string) {
    const link = await prisma.transactionLink.findFirst({
      where: {
        id: linkId,
        fromTransaction: { userId },
      },
    });

    if (!link) {
      throw new Error('Link não encontrado');
    }

    await prisma.transactionLink.delete({
      where: { id: linkId },
    });

    logger.info(`Link excluído: ${linkId}`);
  }

  /**
   * Cria tipos de link padrão
   */
  async seedDefaultTypes() {
    const defaults = [
      {
        name: 'Pagamento',
        inward: 'pago por',
        outward: 'paga',
      },
      {
        name: 'Reembolso',
        inward: 'reembolsado por',
        outward: 'reembolsa',
      },
      {
        name: 'Refund',
        inward: 'refundado por',
        outward: 'refunda',
      },
      {
        name: 'Split',
        inward: 'parte de',
        outward: 'consiste de',
      },
      {
        name: 'Relacionado',
        inward: 'relacionado com',
        outward: 'relacionado com',
      },
    ];

    for (const defaultType of defaults) {
      const existing = await prisma.linkType.findUnique({
        where: { name: defaultType.name },
      });

      if (!existing) {
        await this.createType({
          ...defaultType,
          editable: false,
        });
      }
    }

    logger.info('Tipos de link padrão criados');
  }
}

export default new TransactionLinkService();
