import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import objectGroupService from '@/services/objectGroup.service';
import logger from '@/utils/logger';

class ObjectGroupsController {
  /**
   * GET /api/object-groups - Lista todos os grupos do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const groups = await objectGroupService.findAll(req.user!.userId);
      res.json({ success: true, data: groups });
    } catch (error) {
      logger.error('Erro ao listar grupos:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar grupos' });
    }
  }

  /**
   * GET /api/object-groups/:id - Busca grupo por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const group = await objectGroupService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: group });
    } catch (error) {
      logger.error('Erro ao buscar grupo:', error);
      res.status(404).json({ success: false, message: 'Grupo não encontrado' });
    }
  }

  /**
   * POST /api/object-groups - Cria novo grupo
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const group = await objectGroupService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: group, message: 'Grupo criado com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar grupo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/object-groups/:id - Atualiza grupo
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const group = await objectGroupService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: group, message: 'Grupo atualizado com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar grupo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/object-groups/:id - Exclui grupo
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await objectGroupService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Grupo excluído com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir grupo';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * POST /api/object-groups/reorder - Reordena grupos do usuário
   */
  async reorder(req: AuthRequest, res: Response) {
    try {
      const { groupIds } = req.body;
      await objectGroupService.reorder(req.user!.userId, groupIds);
      res.json({ success: true, message: 'Ordem atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao reordenar grupo:', error);
      const message = error instanceof Error ? error.message : 'Erro ao reordenar grupo';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new ObjectGroupsController();
