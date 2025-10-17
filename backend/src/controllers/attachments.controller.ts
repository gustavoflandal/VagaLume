import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import attachmentService from '@/services/attachment.service';
import logger from '@/utils/logger';

class AttachmentsController {
  /**
   * GET /api/attachments - Lista todos os anexos do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const attachments = await attachmentService.findAll(req.user!.userId);
      res.json({ success: true, data: attachments });
    } catch (error) {
      logger.error('Erro ao listar anexos:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar anexos' });
    }
  }

  /**
   * GET /api/attachments/entity/:type/:id - Anexos de uma entidade
   */
  async getByEntity(req: AuthRequest, res: Response) {
    try {
      const attachments = await attachmentService.findByEntity(
        req.params['type']! as any,
        req.params['id']! as any,
        req.user!.userId
      );
      res.json({ success: true, data: attachments });
    } catch (error) {
      logger.error('Erro ao buscar anexos da entidade:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar anexos da entidade';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/attachments/statistics - Estatísticas dos anexos
   */
  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const statistics = await attachmentService.getStatistics(req.user!.userId);
      res.json({ success: true, data: statistics });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * GET /api/attachments/:id - Busca anexo por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const attachment = await attachmentService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: attachment });
    } catch (error) {
      logger.error('Erro ao buscar anexo:', error);
      res.status(404).json({ success: false, message: 'Anexo não encontrado' });
    }
  }

  /**
   * POST /api/attachments - Cria novo anexo
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const attachment = await attachmentService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: attachment, message: 'Anexo criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar anexo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar anexo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/attachments/:id - Atualiza anexo
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const attachment = await attachmentService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: attachment, message: 'Anexo atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar anexo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar anexo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/attachments/:id - Exclui anexo
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await attachmentService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Anexo excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir anexo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir anexo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/attachments/:id/uploaded - Marca anexo como enviado
   */
  async markAsUploaded(req: AuthRequest, res: Response) {
    try {
      const attachment = await attachmentService.markAsUploaded(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: attachment, message: 'Anexo marcado como enviado' });
    } catch (error) {
      logger.error('Erro ao marcar anexo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao marcar anexo';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new AttachmentsController();
