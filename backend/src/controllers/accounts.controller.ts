import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import accountService from '@/services/account.service';
import logger from '@/utils/logger';

class AccountsController {
  /**
   * GET /api/accounts - Lista todas as contas do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const accounts = await accountService.findAll(req.user!.userId);
      res.json({ success: true, data: accounts });
    } catch (error) {
      logger.error('Erro ao listar contas:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar contas' });
    }
  }

  /**
   * GET /api/accounts/summary - Resumo das contas
   */
  async getSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await accountService.getSummary(req.user!.userId);
      res.json({ success: true, data: summary });
    } catch (error) {
      logger.error('Erro ao buscar resumo:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar resumo' });
    }
  }

  /**
   * GET /api/accounts/:id - Busca conta por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const account = await accountService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: account });
    } catch (error) {
      logger.error('Erro ao buscar conta:', error);
      res.status(404).json({ success: false, message: 'Conta não encontrada' });
    }
  }

  /**
   * POST /api/accounts - Cria nova conta
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const account = await accountService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: account, message: 'Conta criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar conta:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/accounts/:id - Atualiza conta
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const account = await accountService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: account, message: 'Conta atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar conta:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar conta';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/accounts/:id - Exclui conta
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await accountService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Conta excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir conta:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir conta';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new AccountsController();
