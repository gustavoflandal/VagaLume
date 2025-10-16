import { Request, Response, NextFunction } from 'express';
import authService, { RegisterDTO, LoginDTO } from '@/services/auth.service';
import { AuthRequest } from '@/types/express';

class AuthController {
  /**
   * POST /api/auth/register
   * Registra um novo usuário
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterDTO = req.body;

      // Validações básicas
      if (!data.name || !data.email || !data.password) {
        res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios',
        });
        return;
      }

      if (data.password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'A senha deve ter no mínimo 6 caracteres',
        });
        return;
      }

      const user = await authService.register(data);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email já cadastrado') {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Realiza login e retorna tokens
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDTO = req.body;

      // Validações básicas
      if (!data.email || !data.password) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
        });
        return;
      }

      const result = await authService.login(data);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Credenciais inválidas' || error.message === 'Usuário desativado')
      ) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Atualiza access token usando refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório',
        });
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.json({
        success: true,
        message: 'Tokens atualizados com sucesso',
        data: tokens,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Refresh token')) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Realiza logout (revoga refresh token)
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório',
        });
        return;
      }

      await authService.logout(refreshToken);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   */
  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // O usuário vem do middleware de autenticação
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
