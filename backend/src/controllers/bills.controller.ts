import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import billService from '@/services/bill.service';
import logger from '@/utils/logger';

class BillsController {
  /**
   * GET /api/bills - Lista todas as bills do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query['includeInactive'] === 'true';
      const bills = await billService.findAll(req.user!.userId, includeInactive);
      res.json({ success: true, data: bills });
    } catch (error) {
      logger.error('Erro ao listar bills:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar bills' });
    }
  }

  /**
   * GET /api/bills/upcoming - Bills próximas do vencimento
   */
  async getUpcoming(req: AuthRequest, res: Response) {
    try {
      const days = parseInt(req.query['days'] as string) || 7;
      const upcoming = await billService.getUpcoming(req.user!.userId, days);
      res.json({ success: true, data: upcoming });
    } catch (error) {
      logger.error('Erro ao buscar bills próximas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar bills próximas' });
    }
  }

  /**
   * GET /api/bills/statistics - Estatísticas das bills
   */
  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const statistics = await billService.getStatistics(req.user!.userId);
      res.json({ success: true, data: statistics });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * GET /api/bills/:id - Busca bill por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const bill = await billService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: bill });
    } catch (error) {
      logger.error('Erro ao buscar bill:', error);
      res.status(404).json({ success: false, message: 'Bill não encontrada' });
    }
  }

  /**
   * POST /api/bills - Cria nova bill
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const bill = await billService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: bill, message: 'Bill criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar bill:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar bill';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/bills/:id - Atualiza bill
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const bill = await billService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: bill, message: 'Bill atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar bill:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar bill';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/bills/:id - Exclui bill
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await billService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Bill excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir bill:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir bill';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/bills/:id/auto-match - Busca transações para auto-match
   */
  async autoMatch(req: AuthRequest, res: Response) {
    try {
      const candidates = await billService.autoMatchTransactions(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: candidates });
    } catch (error) {
      logger.error('Erro ao buscar candidatos:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar candidatos';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/bills/:id/link-transaction - Vincula transação à bill
   */
  async linkTransaction(req: AuthRequest, res: Response) {
    try {
      const { transactionId } = req.body;
      const transaction = await billService.linkTransaction(req.params['id']!, transactionId, req.user!.userId);
      res.json({ success: true, data: transaction, message: 'Transação vinculada com sucesso' });
    } catch (error) {
      logger.error('Erro ao vincular transação:', error);
      const message = error instanceof Error ? error.message : 'Erro ao vincular transação';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/bills/:id/installments - Lista todas as parcelas de uma bill
   */
  async getInstallments(req: AuthRequest, res: Response) {
    try {
      const installments = await billService.getInstallments(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: installments });
    } catch (error) {
      logger.error('Erro ao listar parcelas:', error);
      const message = error instanceof Error ? error.message : 'Erro ao listar parcelas';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/bills/installments/all - Lista todas as parcelas do usuário
   */
  async getAllInstallments(req: AuthRequest, res: Response) {
    try {
      const installments = await billService.getAllInstallments(req.user!.userId);
      res.json({ success: true, data: installments });
    } catch (error) {
      logger.error('Erro ao listar todas as parcelas:', error);
      const message = error instanceof Error ? error.message : 'Erro ao listar parcelas';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/bills/installments/:id - Atualiza uma parcela
   */
  async updateInstallment(req: AuthRequest, res: Response) {
    try {
      const installment = await billService.updateInstallment(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: installment, message: 'Parcela atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar parcela:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar parcela';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/bills/installments/:id/pay - Marca parcela como paga
   */
  async payInstallment(req: AuthRequest, res: Response) {
    try {
      const { transactionId } = req.body;
      const installment = await billService.payInstallment(req.params['id']!, req.user!.userId, transactionId);
      res.json({ success: true, data: installment, message: 'Parcela marcada como paga' });
    } catch (error) {
      logger.error('Erro ao pagar parcela:', error);
      const message = error instanceof Error ? error.message : 'Erro ao pagar parcela';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/bills/installments/:id - Exclui parcela não paga
   */
  async deleteInstallment(req: AuthRequest, res: Response) {
    try {
      await billService.deleteInstallment(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Parcela excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir parcela:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir parcela';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/bills/:id/regenerate-installments - Regenera parcelas faltantes
   */
  async regenerateInstallments(req: AuthRequest, res: Response) {
    try {
      const count = await billService.regenerateInstallments(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: { count }, message: `${count} parcelas geradas com sucesso` });
    } catch (error) {
      logger.error('Erro ao regenerar parcelas:', error);
      const message = error instanceof Error ? error.message : 'Erro ao regenerar parcelas';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new BillsController();
