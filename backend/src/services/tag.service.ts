import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateTagDTO {
  tag: string;
  date?: Date;
  description?: string;
}

export interface UpdateTagDTO {
  tag?: string;
  date?: Date;
  description?: string;
}

class TagService {
  /**
   * Lista todas as tags do usuário
   */
  async findAll(userId: string) {
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        transactions: {
          include: {
            transaction: true,
          },
        },
        locations: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tags;
  }

  /**
   * Busca tag por ID
   */
  async findById(tagId: string, userId: string) {
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId },
      include: {
        transactions: {
          include: {
            transaction: true,
          },
        },
        locations: true,
        attachments: true,
      },
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    return tag;
  }

  /**
   * Busca ou cria tag
   */
  async findOrCreate(userId: string, tagName: string) {
    let tag = await prisma.tag.findFirst({
      where: { userId, tag: tagName },
    });

    if (!tag) {
      tag = await this.create(userId, { tag: tagName });
    }

    return tag;
  }

  /**
   * Cria nova tag
   */
  async create(userId: string, data: CreateTagDTO) {
    const tag = await prisma.tag.create({
      data: {
        tag: data.tag,
        date: data.date || null,
        description: data.description || null,
        userId,
      },
    });

    logger.info(`Nova tag criada: ${tag.tag} para usuário ${userId}`);
    return tag;
  }

  /**
   * Atualiza tag
   */
  async update(tagId: string, userId: string, data: UpdateTagDTO) {
    await this.findById(tagId, userId);

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data,
    });

    logger.info(`Tag atualizada: ${tag.tag}`);
    return tag;
  }

  /**
   * Exclui tag
   */
  async delete(tagId: string, userId: string) {
    await this.findById(tagId, userId);

    await prisma.tag.delete({
      where: { id: tagId },
    });

    logger.info(`Tag excluída: ${tagId}`);
  }

  /**
   * Obtém cloud de tags (tags mais usadas)
   */
  async getCloud(userId: string, limit = 50) {
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        transactions: {
          select: {
            id: true,
          },
        },
      },
    });

    const cloud: Array<{
      id: string;
      tag: string;
      description: string | null;
      count: number;
    }> = [];

    for (const tag of tags) {
      const usageCount = tag.transactions.length;
      if (usageCount > 0) {
        cloud.push({
          id: tag.id,
          tag: tag.tag,
          description: tag.description ?? null,
          count: usageCount,
        });
      }
    }

    cloud.sort((a, b) => b.count - a.count);

    return cloud.slice(0, limit);
  }

  /**
   * Pesquisa tags por nome
   */
  async search(userId: string, query: string, limit = 10) {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
        tag: {
          contains: query,
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return tags;
  }

  /**
   * Vincula tag a transação
   */
  async linkToTransaction(tagId: string, transactionId: string, userId: string) {
    // Verifica se a tag pertence ao usuário
    await this.findById(tagId, userId);

    // Verifica se a transação pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    // Verifica se já não está vinculada
    const existing = await prisma.transactionTag.findUnique({
      where: {
        transactionId_tagId: {
          transactionId,
          tagId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Cria vínculo
    const link = await prisma.transactionTag.create({
      data: {
        transactionId,
        tagId,
      },
    });

    logger.info(`Tag ${tagId} vinculada à transação ${transactionId}`);
    return link;
  }

  /**
   * Remove vínculo entre tag e transação
   */
  async unlinkFromTransaction(tagId: string, transactionId: string, userId: string) {
    await this.findById(tagId, userId);

    const link = await prisma.transactionTag.findUnique({
      where: {
        transactionId_tagId: {
          transactionId,
          tagId,
        },
      },
    });

    if (!link) {
      throw new Error('Vínculo não encontrado');
    }

    await prisma.transactionTag.delete({
      where: {
        id: link.id,
      },
    });

    logger.info(`Tag ${tagId} desvinculada da transação ${transactionId}`);
  }

  /**
   * Obtém estatísticas de uso das tags
   */
  async getStatistics(userId: string) {
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        transactions: {
          select: {
            id: true,
          },
        },
      },
    });

    const total = tags.length;

    let used = 0;
    let totalUsage = 0;

    for (const tag of tags) {
      const usage = tag.transactions.length;
      totalUsage += usage;
      if (usage > 0) {
        used += 1;
      }
    }

    const unused = total - used;
    const avgUsage = total > 0 ? totalUsage / total : 0;

    return {
      total,
      used,
      unused,
      totalUsage,
      avgUsage: Math.round(avgUsage * 100) / 100,
    };
  }
}

export default new TagService();
