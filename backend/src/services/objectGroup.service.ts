import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateObjectGroupDTO {
  title: string;
  order?: number;
}

export interface UpdateObjectGroupDTO {
  title?: string;
  order?: number;
}

class ObjectGroupService {
  /**
   * Lista todos os grupos do usuário
   */
  async findAll(userId: string) {
    const groups = await prisma.objectGroup.findMany({
      where: { userId },
      include: {
        piggyBanks: true,
        bills: true,
      },
      orderBy: { order: 'asc' },
    });

    return groups;
  }

  /**
   * Busca grupo por ID
   */
  async findById(groupId: string, userId: string) {
    const group = await prisma.objectGroup.findFirst({
      where: { id: groupId, userId },
      include: {
        piggyBanks: true,
        bills: true,
      },
    });

    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    return group;
  }

  /**
   * Cria novo grupo
   */
  async create(userId: string, data: CreateObjectGroupDTO) {
    const group = await prisma.objectGroup.create({
      data: {
        title: data.title,
        order: data.order ?? 0,
        userId,
      },
    });

    logger.info(`Novo grupo criado: ${group.title} para usuário ${userId}`);
    return group;
  }

  /**
   * Atualiza grupo
   */
  async update(groupId: string, userId: string, data: UpdateObjectGroupDTO) {
    await this.findById(groupId, userId);

    const group = await prisma.objectGroup.update({
      where: { id: groupId },
      data,
    });

    logger.info(`Grupo atualizado: ${group.title}`);
    return group;
  }

  /**
   * Exclui grupo
   */
  async delete(groupId: string, userId: string) {
    await this.findById(groupId, userId);

    await prisma.objectGroup.delete({
      where: { id: groupId },
    });

    logger.info(`Grupo excluído: ${groupId}`);
  }

  /**
   * Reordena grupos
   */
  async reorder(_userId: string, groupIds: string[]) {
    const updates = groupIds.map((groupId, index) =>
      prisma.objectGroup.update({
        where: { id: groupId },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    logger.info(`${groupIds.length} grupos reordenados`);
  }
}

export default new ObjectGroupService();
