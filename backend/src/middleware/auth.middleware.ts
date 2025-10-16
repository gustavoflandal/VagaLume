import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import authService from '@/services/auth.service';
import { AuthRequest } from '@/types/express';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

/**
 * Middleware para verificar token JWT
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token
    const payload = authService.verifyAccessToken(token);

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Usuário desativado',
      });
      return;
    }

    // Adicionar usuário ao request (incluindo userId como alias de id)
    req.user = {
      ...user,
      userId: user.id,
    };
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    
    if (error instanceof Error && error.message.includes('Token')) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
    });
  }
};

/**
 * Middleware opcional - não retorna erro se não houver token
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        ...user,
        userId: user.id,
      };
    }

    next();
  } catch (error) {
    // Ignora erros em autenticação opcional
    next();
  }
};
