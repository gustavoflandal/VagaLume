import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import budgetService from '@/services/budget.service';
import logger from '@/utils/logger';

class BudgetsController {
  /**
   * GET /api/budgets - Lista todos os budgets do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query['includeInactive'] === 'true';
      const budgets = await budgetService.findAll(req.user!.userId, includeInactive);
      res.json({ success: true, data: budgets });
    } catch (error) {
      logger.error('Erro ao listar budgets:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar budgets' });
    }
  }

  /**
   * GET /api/budgets/:id - Busca budget por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const budget = await budgetService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: budget });
    } catch (error) {
      logger.error('Erro ao buscar budget:', error);
      res.status(404).json({ success: false, message: 'Budget não encontrado' });
    }
  }

  /**
   * POST /api/budgets - Cria novo budget
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const budget = await budgetService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: budget, message: 'Budget criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar budget:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar budget';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/budgets/:id - Atualiza budget
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const budget = await budgetService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: budget, message: 'Budget atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar budget:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar budget';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/budgets/:id - Exclui budget
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await budgetService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Budget excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir budget:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir budget';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/budgets/:id/check - Verifica se budget ultrapassou limite
   */
  async checkExceeded(req: AuthRequest, res: Response) {
    try {
      const result = await budgetService.checkExceeded(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Erro ao verificar limite:', error);
      const message = error instanceof Error ? error.message : 'Erro ao verificar limite';
      res.status(400).json({ success: false, message });
    }
  }

  // ============ LIMITS ============

  /**
   * POST /api/budgets/limits - Cria limite para budget
   */
  async createLimit(req: AuthRequest, res: Response) {
    try {
      const limit = await budgetService.createLimit(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: limit, message: 'Limite criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar limite:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar limite';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/budgets/limits/:id - Atualiza limite
   */
  async updateLimit(req: AuthRequest, res: Response) {
    try {
      const limit = await budgetService.updateLimit(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: limit, message: 'Limite atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar limite:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar limite';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/budgets/limits/:id - Exclui limite
   */
  async deleteLimit(req: AuthRequest, res: Response) {
    try {
      await budgetService.deleteLimit(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Limite excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir limite:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir limite';
      res.status(400).json({ success: false, message });
    }
  }

  // ============ AUTO-BUDGET ============

  /**
   * POST /api/budgets/:id/auto-budget - Configura auto-budget
   */
  async setAutoBudget(req: AuthRequest, res: Response) {
    try {
      const autoBudget = await budgetService.setAutoBudget(req.user!.userId, {
        budgetId: req.params['id']!,
        ...req.body,
      });
      res.json({ success: true, data: autoBudget, message: 'Auto-budget configurado com sucesso' });
    } catch (error) {
      logger.error('Erro ao configurar auto-budget:', error);
      const message = error instanceof Error ? error.message : 'Erro ao configurar auto-budget';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/budgets/:id/auto-budget - Remove auto-budget
   */
  async removeAutoBudget(req: AuthRequest, res: Response) {
    try {
      await budgetService.removeAutoBudget(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Auto-budget removido com sucesso' });
    } catch (error) {
      logger.error('Erro ao remover auto-budget:', error);
      const message = error instanceof Error ? error.message : 'Erro ao remover auto-budget';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new BudgetsController();
