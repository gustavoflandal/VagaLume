import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface UpdateUserDTO {
  name?: string;
  avatar?: string;
  email?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  /**
   * Busca usuário por ID
   */
  async findById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        emailVerified: true,
        twoFactorEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Atualiza dados do usuário
   */
  async update(userId: string, data: UpdateUserDTO) {
    // Se estiver mudando o email, verificar se não existe outro usuário com esse email
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        emailVerified: true,
        twoFactorEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Usuário atualizado: ${user.email}`);
    return user;
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Senha alterada para usuário: ${user.email}`);
  }

  /**
   * Desativa usuário (soft delete)
   */
  async deactivate(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    logger.info(`Usuário desativado: ${userId}`);
  }
}

export default new UserService();
