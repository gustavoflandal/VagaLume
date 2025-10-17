import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import ruleService from '@/services/rule.service';
import logger from '@/utils/logger';

class RulesController {
  // ============ GROUPS ============

  /**
   * GET /api/rules/groups - Lista todos os grupos de regras
   */
  async getAllGroups(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query['includeInactive'] === 'true';
      const groups = await ruleService.findAllGroups(req.user!.userId, includeInactive);
      res.json({ success: true, data: groups });
    } catch (error) {
      logger.error('Erro ao listar grupos:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar grupos' });
    }
  }

  /**
   * GET /api/rules/groups/:id - Busca grupo por ID
   */
  async getGroupById(req: AuthRequest, res: Response) {
    try {
      const group = await ruleService.findGroupById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: group });
    } catch (error) {
      logger.error('Erro ao buscar grupo:', error);
      res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    }
  }

  /**
   * POST /api/rules/groups - Cria novo grupo
   */
  async createGroup(req: AuthRequest, res: Response) {
    try {
      const group = await ruleService.createGroup(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: group, message: 'Grupo criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar grupo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/rules/groups/:id - Atualiza grupo
   */
  async updateGroup(req: AuthRequest, res: Response) {
    try {
      const group = await ruleService.updateGroup(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: group, message: 'Grupo atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar grupo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/rules/groups/:id - Exclui grupo
   */
  async deleteGroup(req: AuthRequest, res: Response) {
    try {
      await ruleService.deleteGroup(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Grupo excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir grupo';
      res.status(400).json({ success: false, message });
    }
  }

  // ============ RULES ============

  /**
   * GET /api/rules/:id - Busca regra por ID
   */
  async getRuleById(req: AuthRequest, res: Response) {
    try {
      const rule = await ruleService.findRuleById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: rule });
    } catch (error) {
      logger.error('Erro ao buscar regra:', error);
      res.status(404).json({ success: false, message: 'Regra não encontrada' });
    }
  }

  /**
   * POST /api/rules - Cria nova regra
   */
  async createRule(req: AuthRequest, res: Response) {
    try {
      const rule = await ruleService.createRule(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: rule, message: 'Regra criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar regra:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar regra';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/rules/:id - Atualiza regra
   */
  async updateRule(req: AuthRequest, res: Response) {
    try {
      const rule = await ruleService.updateRule(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: rule, message: 'Regra atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar regra:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar regra';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/rules/:id - Exclui regra
   */
  async deleteRule(req: AuthRequest, res: Response) {
    try {
      await ruleService.deleteRule(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Regra excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir regra:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir regra';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/rules/:id/test - Testa regra contra transações
   */
  async testRule(req: AuthRequest, res: Response) {
    try {
      const result = await ruleService.testRule(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Erro ao testar regra:', error);
      const message = error instanceof Error ? error.message : 'Erro ao testar regra';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/rules/:id/apply - Aplica regra a uma transação
   */
  async applyRule(req: AuthRequest, res: Response) {
    try {
      const { transactionId } = req.body;
      const transaction = await ruleService.applyRule(req.params['id']!, transactionId, req.user!.userId);
      res.json({ success: true, data: transaction, message: 'Regra aplicada com sucesso' });
    } catch (error) {
      logger.error('Erro ao aplicar regra:', error);
      const message = error instanceof Error ? error.message : 'Erro ao aplicar regra';
      res.status(400).json({ success: false, message });
    }
  }

  // ============ TRIGGERS ============

  /**
   * POST /api/rules/triggers - Adiciona trigger à regra
   */
  async addTrigger(req: AuthRequest, res: Response) {
    try {
      const trigger = await ruleService.addTrigger(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: trigger, message: 'Trigger adicionado com sucesso' });
    } catch (error) {
      logger.error('Erro ao adicionar trigger:', error);
      const message = error instanceof Error ? error.message : 'Erro ao adicionar trigger';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/rules/triggers/:id - Remove trigger
   */
  async removeTrigger(req: AuthRequest, res: Response) {
    try {
      await ruleService.removeTrigger(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Trigger removido com sucesso' });
    } catch (error) {
      logger.error('Erro ao remover trigger:', error);
      const message = error instanceof Error ? error.message : 'Erro ao remover trigger';
      res.status(400).json({ success: false, message });
    }
  }

  // ============ ACTIONS ============

  /**
   * POST /api/rules/actions - Adiciona action à regra
   */
  async addAction(req: AuthRequest, res: Response) {
    try {
      const action = await ruleService.addAction(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: action, message: 'Action adicionada com sucesso' });
    } catch (error) {
      logger.error('Erro ao adicionar action:', error);
      const message = error instanceof Error ? error.message : 'Erro ao adicionar action';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/rules/actions/:id - Remove action
   */
  async removeAction(req: AuthRequest, res: Response) {
    try {
      await ruleService.removeAction(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Action removida com sucesso' });
    } catch (error) {
      logger.error('Erro ao remover action:', error);
      const message = error instanceof Error ? error.message : 'Erro ao remover action';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new RulesController();
