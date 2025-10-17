import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import transactionLinkService from '@/services/transactionLink.service';
import logger from '@/utils/logger';

class TransactionLinksController {
  // ============ LINK TYPES ============

  /**
   * GET /api/transaction-links/types - Lista todos os tipos de link
   */
  async getAllTypes(_req: AuthRequest, res: Response) {
    try {
      const types = await transactionLinkService.findAllTypes();
      res.json({ success: true, data: types });
    } catch (error) {
      logger.error('Erro ao listar tipos de link:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar tipos de link' });
    }
  }

  /**
   * GET /api/transaction-links/types/:id - Busca tipo de link por ID
   */
  async getTypeById(req: AuthRequest, res: Response) {
    try {
      const type = await transactionLinkService.findTypeById(req.params['id']!);
      res.json({ success: true, data: type });
    } catch (error) {
      logger.error('Erro ao buscar tipo de link:', error);
      res.status(404).json({ success: false, message: 'Tipo de link não encontrado' });
    }
  }

  /**
   * POST /api/transaction-links/types - Cria novo tipo de link
   */
  async createType(req: AuthRequest, res: Response) {
    try {
      const type = await transactionLinkService.createType(req.body);
      res.status(201).json({ success: true, data: type, message: 'Tipo de link criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar tipo de link:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar tipo de link';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/transaction-links/types/:id - Atualiza tipo de link
   */
  async updateType(req: AuthRequest, res: Response) {
    try {
      const type = await transactionLinkService.updateType(req.params['id']!, req.body);
      res.json({ success: true, data: type, message: 'Tipo de link atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar tipo de link:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar tipo de link';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/transaction-links/types/:id - Exclui tipo de link
   */
  async deleteType(req: AuthRequest, res: Response) {
    try {
      await transactionLinkService.deleteType(req.params['id']!);
      res.json({ success: true, message: 'Tipo de link excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir tipo de link:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir tipo de link';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/transaction-links/types/seed - Cria tipos padrão
   */
  async seedDefaultTypes(_req: AuthRequest, res: Response) {
    try {
      await transactionLinkService.seedDefaultTypes();
      res.json({ success: true, message: 'Tipos padrão criados com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar tipos padrão:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar tipos padrão';
      res.status(400).json({ success: false, message });
    }
  }

  // ============ LINKS ============

  /**
   * GET /api/transaction-links/transaction/:transactionId - Links de uma transação
   */
  async getByTransaction(req: AuthRequest, res: Response) {
    try {
      const links = await transactionLinkService.findByTransaction(req.params['transactionId']!, req.user!.userId);
      res.json({ success: true, data: links });
    } catch (error) {
      logger.error('Erro ao buscar links:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar links';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/transaction-links - Cria novo link entre transações
   */
  async createLink(req: AuthRequest, res: Response) {
    try {
      const link = await transactionLinkService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: link, message: 'Link criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar link:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar link';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/transaction-links/:id - Exclui link
   */
  async deleteLink(req: AuthRequest, res: Response) {
    try {
      await transactionLinkService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Link excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir link:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir link';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new TransactionLinksController();
