import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import userService from '@/services/user.service';
import logger from '@/utils/logger';

class UsersController {
  /**
   * GET /api/users/me - Retorna dados do usuário autenticado
   */
  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await userService.findById(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
  }

  /**
   * PUT /api/users/me - Atualiza dados do usuário autenticado
   */
  async updateMe(req: AuthRequest, res: Response) {
    try {
      const user = await userService.update(req.user!.userId, req.body);
      res.json({ success: true, data: user, message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/users/me/password - Altera senha do usuário
   */
  async changePassword(req: AuthRequest, res: Response) {
    try {
      await userService.changePassword(req.user!.userId, req.body);
      res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/users/me - Desativa conta do usuário
   */
  async deactivate(req: AuthRequest, res: Response) {
    try {
      await userService.deactivate(req.user!.userId);
      res.json({ success: true, message: 'Conta desativada com sucesso' });
    } catch (error) {
      logger.error('Erro ao desativar conta:', error);
      res.status(400).json({ success: false, message: 'Erro ao desativar conta' });
    }
  }

  /**
   * GET /api/users/me/export - Exporta todos os dados do usuário
   */
  async exportData(req: AuthRequest, res: Response) {
    try {
      const data = await userService.exportData(req.user!.userId);
      
      // Definir headers para download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="vagalume-export-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(data);
    } catch (error) {
      logger.error('Erro ao exportar dados:', error);
      res.status(400).json({ success: false, message: 'Erro ao exportar dados' });
    }
  }
}

export default new UsersController();
