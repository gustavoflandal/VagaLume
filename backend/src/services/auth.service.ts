import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '@/config';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterDTO): Promise<UserResponse> {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
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

    logger.info(`Novo usuário registrado: ${user.email}`);
    return user;
  }

  /**
   * Realiza login e retorna tokens
   */
  async login(data: LoginDTO): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new Error('Usuário desativado');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = await this.generateTokens({ userId: user.id, email: user.email });

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`Login realizado: ${user.email}`);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  /**
   * Gera novos tokens (access + refresh)
   */
  private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    // Gerar access token (curta duração)
    const accessToken = jwt.sign(payload, config.jwt.secret as string, {
      expiresIn: config.jwt.expiresIn as string,
    } as jwt.SignOptions);

    // Gerar refresh token (longa duração)
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret as string, {
      expiresIn: config.jwt.refreshExpiresIn as string,
    } as jwt.SignOptions);

    // Salvar refresh token no banco
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Atualiza tokens usando refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verificar se o token é válido
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;

      // Verificar se o refresh token existe no banco
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.userId,
          isRevoked: false,
          expiresAt: { gte: new Date() },
        },
      });

      if (!storedToken) {
        throw new Error('Refresh token inválido ou expirado');
      }

      // Verificar se o usuário ainda está ativo
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new Error('Usuário inválido ou desativado');
      }

      // Revogar o refresh token antigo
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      // Gerar novos tokens
      const tokens = await this.generateTokens({ userId: user.id, email: user.email });

      logger.info(`Tokens atualizados para usuário: ${user.email}`);
      return tokens;
    } catch (error) {
      logger.error('Erro ao atualizar tokens:', error);
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Realiza logout (revoga refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;

      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId: decoded.userId,
        },
        data: {
          isRevoked: true,
        },
      });

      logger.info(`Logout realizado para usuário: ${decoded.email}`);
    } catch (error) {
      logger.error('Erro ao realizar logout:', error);
      // Não propagar erro, pois logout deve sempre funcionar
    }
  }

  /**
   * Verifica se um access token é válido
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
}

export default new AuthService();
