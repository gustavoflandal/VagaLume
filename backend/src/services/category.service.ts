import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateCategoryDTO {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

class CategoryService {
  /**
   * Lista todas as categorias do usuário
   */
  async findAll(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        parent: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  /**
   * Busca categoria por ID
   */
  async findById(categoryId: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      include: {
        parent: true,
      },
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Cria nova categoria
   */
  async create(userId: string, data: CreateCategoryDTO) {
    // Se houver parentId, verificar se a categoria pai existe
    if (data.parentId) {
      const parent = await prisma.category.findFirst({
        where: { id: data.parentId, userId },
      });

      if (!parent) {
        throw new Error('Categoria pai não encontrada');
      }
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        userId,
      },
      include: {
        parent: true,
      },
    });

    logger.info(`Nova categoria criada: ${category.name} para usuário ${userId}`);
    return category;
  }

  /**
   * Atualiza categoria
   */
  async update(categoryId: string, userId: string, data: UpdateCategoryDTO) {
    // Verificar se a categoria pertence ao usuário
    await this.findById(categoryId, userId);

    // Se houver parentId, verificar se a categoria pai existe
    if (data.parentId) {
      if (data.parentId === categoryId) {
        throw new Error('Categoria não pode ser pai dela mesma');
      }

      const parent = await prisma.category.findFirst({
        where: { id: data.parentId, userId },
      });

      if (!parent) {
        throw new Error('Categoria pai não encontrada');
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
      include: {
        parent: true,
      },
    });

    logger.info(`Categoria atualizada: ${category.name}`);
    return category;
  }

  /**
   * Exclui categoria (soft delete)
   */
  async delete(categoryId: string, userId: string) {
    // Verificar se a categoria pertence ao usuário
    await this.findById(categoryId, userId);

    // Verificar se há transações associadas
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId },
    });

    if (transactionsCount > 0) {
      // Se houver transações, apenas desativar
      await prisma.category.update({
        where: { id: categoryId },
        data: { isActive: false },
      });
      logger.info(`Categoria desativada (tem transações): ${categoryId}`);
    } else {
      // Se não houver transações, excluir permanentemente
      await prisma.category.delete({
        where: { id: categoryId },
      });
      logger.info(`Categoria excluída: ${categoryId}`);
    }
  }
}

export default new CategoryService();
