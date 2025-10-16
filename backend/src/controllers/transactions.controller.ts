import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import transactionService, { TransactionFilters } from '@/services/transaction.service';
import logger from '@/utils/logger';

class TransactionsController {
  /**
   * GET /api/transactions - Lista transações com filtros e paginação
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 50;

      const filters: TransactionFilters = {};
      if (req.query['type']) filters.type = req.query['type'] as any;
      if (req.query['status']) filters.status = req.query['status'] as any;
      if (req.query['categoryId']) filters.categoryId = req.query['categoryId'] as string;
      if (req.query['accountId']) filters.accountId = req.query['accountId'] as string;
      if (req.query['startDate']) filters.startDate = new Date(req.query['startDate'] as string);
      if (req.query['endDate']) filters.endDate = new Date(req.query['endDate'] as string);
      if (req.query['minAmount']) filters.minAmount = parseFloat(req.query['minAmount'] as string);
      if (req.query['maxAmount']) filters.maxAmount = parseFloat(req.query['maxAmount'] as string);

      const result = await transactionService.findAll(req.user!.userId, filters, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error('Erro ao listar transações:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar transações' });
    }
  }

  /**
   * GET /api/transactions/summary - Resumo financeiro
   */
  async getSummary(req: AuthRequest, res: Response) {
    try {
      const startDate = req.query['startDate'] ? new Date(req.query['startDate'] as string) : undefined;
      const endDate = req.query['endDate'] ? new Date(req.query['endDate'] as string) : undefined;

      const summary = await transactionService.getSummary(req.user!.userId, startDate, endDate);
      res.json({ success: true, data: summary });
    } catch (error) {
      logger.error('Erro ao buscar resumo:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar resumo' });
    }
  }

  /**
   * GET /api/transactions/:id - Busca transação por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const transaction = await transactionService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: transaction });
    } catch (error) {
      logger.error('Erro ao buscar transação:', error);
      res.status(404).json({ success: false, message: 'Transação não encontrada' });
    }
  }

  /**
   * POST /api/transactions - Cria nova transação
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const transaction = await transactionService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: transaction, message: 'Transação criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar transação:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar transação';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/transactions/:id - Atualiza transação
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const transaction = await transactionService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: transaction, message: 'Transação atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar transação:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar transação';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/transactions/:id - Exclui transação
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await transactionService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Transação excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir transação:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir transação';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new TransactionsController();
