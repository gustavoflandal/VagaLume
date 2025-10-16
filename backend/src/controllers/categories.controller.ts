import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import categoryService from '@/services/category.service';
import logger from '@/utils/logger';

class CategoriesController {
  /**
   * GET /api/categories - Lista todas as categorias do usuário
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const categories = await categoryService.findAll(req.user!.userId);
      res.json({ success: true, data: categories });
    } catch (error) {
      logger.error('Erro ao listar categorias:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar categorias' });
    }
  }

  /**
   * GET /api/categories/:id - Busca categoria por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const category = await categoryService.findById(req.params['id']!, req.user!.userId);
      res.json({ success: true, data: category });
    } catch (error) {
      logger.error('Erro ao buscar categoria:', error);
      res.status(404).json({ success: false, message: 'Categoria não encontrada' });
    }
  }

  /**
   * POST /api/categories - Cria nova categoria
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const category = await categoryService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: category, message: 'Categoria criada com sucesso' });
    } catch (error) {
      logger.error('Erro ao criar categoria:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * PUT /api/categories/:id - Atualiza categoria
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const category = await categoryService.update(req.params['id']!, req.user!.userId, req.body);
      res.json({ success: true, data: category, message: 'Categoria atualizada com sucesso' });
    } catch (error) {
      logger.error('Erro ao atualizar categoria:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/categories/:id - Exclui categoria
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await categoryService.delete(req.params['id']!, req.user!.userId);
      res.json({ success: true, message: 'Categoria excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir categoria:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir categoria';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new CategoriesController();
