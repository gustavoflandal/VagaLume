import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import settingsService from '@/services/settings.service';
import logger from '@/utils/logger';

class SettingsController {
  /**
   * GET /api/settings - Retorna configurações do usuário
   */
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.getSettings(req.user!.userId);
      res.json({ success: true, data: settings });
    } catch (error) {
      logger.error('Erro ao buscar configurações:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar configurações' });
    }
  }

  /**
   * PUT /api/settings - Atualiza configurações do usuário
   */
  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.updateSettings(req.user!.userId, req.body);
      res.json({ success: true, data: settings, message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar configurações:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar configurações';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/settings/reset - Reseta configurações para valores padrão
   */
  async resetSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.resetSettings(req.user!.userId);
      res.json({ success: true, data: settings, message: 'Configurações resetadas com sucesso' });
    } catch (error) {
      logger.error('Erro ao resetar configurações:', error);
      res.status(500).json({ success: false, message: 'Erro ao resetar configurações' });
    }
  }
}

export default new SettingsController();
