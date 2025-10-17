import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import piggyBankService from '@/services/piggyBank.service';
import logger from '@/utils/logger';

class PiggyBanksController {
  /**
   * GET /api/piggy-banks - Lista todos os cofrinhos do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query['includeInactive'] === 'true';
      const piggyBanks = await piggyBankService.findAll(req.user!.userId, includeInactive);
      res.json({ success: true, data: piggyBanks });
    } catch (error) {
      logger.error('Erro ao listar cofrinhos:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar cofrinhos' });
    }
  }

  /**
   * GET /api/piggy-banks/statistics - Estatísticas dos cofrinhos
   */
  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const statistics = await piggyBankService.getStatistics(req.user!.userId);
      res.json({ success: true, data: statistics });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * GET /api/piggy-banks/:id - Busca cofrinho por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const piggyBank = await piggyBankService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: piggyBank });
    } catch (error) {
      logger.error('Erro ao buscar cofrinho:', error);
      res.status(404).json({ success: false, message: 'Cofrinho não encontrado' });
    }
  }

  /**
   * POST /api/piggy-banks - Cria novo cofrinho
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const piggyBank = await piggyBankService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: piggyBank, message: 'Cofrinho criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar cofrinho:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar cofrinho';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/piggy-banks/:id - Atualiza cofrinho
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const piggyBank = await piggyBankService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: piggyBank, message: 'Cofrinho atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar cofrinho:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar cofrinho';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/piggy-banks/:id - Exclui cofrinho
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await piggyBankService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Cofrinho excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir cofrinho:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir cofrinho';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/piggy-banks/:id/add-money - Adiciona dinheiro ao cofrinho
   */
  async addMoney(req: AuthRequest, res: Response) {
    try {
      const result = await piggyBankService.addMoney(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: result, message: 'Dinheiro adicionado com sucesso' });
    } catch (error) {
      logger.error('Erro ao adicionar dinheiro:', error);
      const message = error instanceof Error ? error.message : 'Erro ao adicionar dinheiro';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/piggy-banks/:id/remove-money - Remove dinheiro do cofrinho
   */
  async removeMoney(req: AuthRequest, res: Response) {
    try {
      const result = await piggyBankService.removeMoney(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: result, message: 'Dinheiro removido com sucesso' });
    } catch (error) {
      logger.error('Erro ao remover dinheiro:', error);
      const message = error instanceof Error ? error.message : 'Erro ao remover dinheiro';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new PiggyBanksController();
