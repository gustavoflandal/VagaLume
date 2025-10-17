import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import webhookService from '@/services/webhook.service';
import logger from '@/utils/logger';

class WebhooksController {
  /**
   * GET /api/webhooks - Lista todos os webhooks do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query['includeInactive'] === 'true';
      const webhooks = await webhookService.findAll(req.user!.userId, includeInactive);
      res.json({ success: true, data: webhooks });
    } catch (error) {
      logger.error('Erro ao listar webhooks:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar webhooks' });
    }
  }

  /**
   * GET /api/webhooks/statistics - Estatísticas dos webhooks
   */
  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const statistics = await webhookService.getStatistics(req.user!.userId);
      res.json({ success: true, data: statistics });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * GET /api/webhooks/:id - Busca webhook por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const webhook = await webhookService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: webhook });
    } catch (error) {
      logger.error('Erro ao buscar webhook:', error);
      res.status(404).json({ success: false, message: 'Webhook não encontrado' });
    }
  }

  /**
   * POST /api/webhooks - Cria novo webhook
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const webhook = await webhookService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: webhook, message: 'Webhook criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar webhook:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar webhook';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/webhooks/:id - Atualiza webhook
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const webhook = await webhookService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: webhook, message: 'Webhook atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar webhook:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar webhook';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/webhooks/:id - Exclui webhook
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await webhookService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Webhook excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir webhook:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir webhook';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/webhooks/:id/test - Testa webhook
   */
  async test(req: AuthRequest, res: Response) {
    try {
      const result = await webhookService.test(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: result, message: 'Webhook testado com sucesso' });
    } catch (error) {
      logger.error('Erro ao testar webhook:', error);
      const message = error instanceof Error ? error.message : 'Erro ao testar webhook';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/webhooks/:id/retry - Reenvia mensagem falhada
   */
  async retry(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.body;
      const result = await webhookService.retry(messageId, req.user!.userId);
      res.json({ success: true, data: result, message: 'Mensagem reenviada com sucesso' });
    } catch (error) {
      logger.error('Erro ao reenviar mensagem:', error);
      const message = error instanceof Error ? error.message : 'Erro ao reenviar mensagem';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/webhooks/:id/history - Histórico de mensagens
   */
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query['limit'] as string) || 50;
      const history = await webhookService.getHistory(req.params['id']!, req.user!.userId, limit);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error('Erro ao buscar histórico:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar histórico';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/webhooks/process-pending - Processa mensagens pendentes (usado por cron)
   */
  async processPending(_req: AuthRequest, res: Response) {
    try {
      const result = await webhookService.processPending();
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Erro ao processar pendentes:', error);
      const message = error instanceof Error ? error.message : 'Erro ao processar pendentes';
      res.status(500).json({ success: false, message });
    }
  }
}

export default new WebhooksController();
