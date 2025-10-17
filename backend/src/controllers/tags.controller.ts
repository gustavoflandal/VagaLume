import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import tagService from '@/services/tag.service';
import logger from '@/utils/logger';

class TagsController {
  /**
   * GET /api/tags - Lista todas as tags do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const tags = await tagService.findAll(req.user!.userId);
      res.json({ success: true, data: tags });
    } catch (error) {
      logger.error('Erro ao listar tags:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar tags' });
    }
  }

  /**
   * GET /api/tags/cloud - Nuvem de tags (top 50)
   */
  async getCloud(req: AuthRequest, res: Response) {
    try {
      const cloud = await tagService.getCloud(req.user!.userId);
      res.json({ success: true, data: cloud });
    } catch (error) {
      logger.error('Erro ao buscar nuvem de tags:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar nuvem de tags' });
    }
  }

  /**
   * GET /api/tags/search - Busca tags por texto
   */
  async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.query['q'] as string;
      if (!query) {
        res.status(400).json({ success: false, message: 'Parâmetro q obrigatório' });
        return;
      }
      const tags = await tagService.search(req.user!.userId, query);
      res.json({ success: true, data: tags });
    } catch (error) {
      logger.error('Erro ao buscar tags:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar tags' });
    }
  }

  /**
   * GET /api/tags/statistics - Estatísticas das tags
   */
  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const statistics = await tagService.getStatistics(req.user!.userId);
      res.json({ success: true, data: statistics });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * GET /api/tags/:id - Busca tag por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const tag = await tagService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: tag });
    } catch (error) {
      logger.error('Erro ao buscar tag:', error);
      res.status(404).json({ success: false, message: 'Tag não encontrada' });
    }
  }

  /**
   * POST /api/tags - Cria nova tag
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const tag = await tagService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: tag, message: 'Tag criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar tag:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar tag';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/tags/:id - Atualiza tag
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const tag = await tagService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: tag, message: 'Tag atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar tag:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar tag';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/tags/:id - Exclui tag
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await tagService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Tag excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir tag:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir tag';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/tags/:id/link - Vincula tag a transação
   */
  async linkToTransaction(req: AuthRequest, res: Response) {
    try {
      const { transactionId } = req.body;
      await tagService.linkToTransaction(req.params['id']!, transactionId, req.user!.userId);
      res.json({ success: true, message: 'Tag vinculada com sucesso' });
    } catch (error) {
      logger.error('Erro ao vincular tag:', error);
      const message = error instanceof Error ? error.message : 'Erro ao vincular tag';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/tags/:id/unlink/:transactionId - Desvincula tag de transação
   */
  async unlinkFromTransaction(req: AuthRequest, res: Response) {
    try {
      await tagService.unlinkFromTransaction(req.params['id']!, req.params['transactionId']!, req.user!.userId);
      res.json({ success: true, message: 'Tag desvinculada com sucesso' });
    } catch (error) {
      logger.error('Erro ao desvincular tag:', error);
      const message = error instanceof Error ? error.message : 'Erro ao desvincular tag';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new TagsController();
