import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import recurrenceService from '@/services/recurrence.service';
import logger from '@/utils/logger';

class RecurrencesController {
  /**
   * GET /api/recurrences - Lista todas as recorrências do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query['includeInactive'] === 'true';
      const recurrences = await recurrenceService.findAll(req.user!.userId, includeInactive);
      res.json({ success: true, data: recurrences });
    } catch (error) {
      logger.error('Erro ao listar recorrências:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar recorrências' });
    }
  }

  /**
   * GET /api/recurrences/:id - Busca recorrência por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const recurrence = await recurrenceService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: recurrence });
    } catch (error) {
      logger.error('Erro ao buscar recorrência:', error);
      res.status(404).json({ success: false, message: 'Recorrência não encontrada' });
    }
  }

  /**
   * POST /api/recurrences - Cria nova recorrência
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const recurrence = await recurrenceService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: recurrence, message: 'Recorrência criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar recorrência:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar recorrência';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/recurrences/:id - Atualiza recorrência
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const recurrence = await recurrenceService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: recurrence, message: 'Recorrência atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar recorrência:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar recorrência';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/recurrences/:id - Exclui recorrência
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await recurrenceService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Recorrência excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir recorrência:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir recorrência';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/recurrences/:id/next-occurrences - Próximas ocorrências
   */
  async getNextOccurrences(req: AuthRequest, res: Response) {
    try {
      const count = parseInt(req.query['count'] as string) || 5;
      const occurrences = await recurrenceService.getNextOccurrences(req.params['id']!, req.user!.userId, count);
      res.json({ success: true, data: occurrences });
    } catch (error) {
      logger.error('Erro ao buscar próximas ocorrências:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar próximas ocorrências';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/recurrences/generate-all - Gera transações pendentes de todas recorrências
   */
  async generateAll(_req: AuthRequest, res: Response) {
    try {
      const result = await recurrenceService.generateTransactions();
      res.json({ 
        success: true, 
        data: result, 
        message: `${result.generated} transação(ões) gerada(s) com sucesso` 
      });
    } catch (error) {
      logger.error('Erro ao gerar transações:', error);
      const message = error instanceof Error ? error.message : 'Erro ao gerar transações';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new RecurrencesController();
