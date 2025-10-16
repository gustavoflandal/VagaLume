import { Router } from 'express';
import categoriesController from '@/controllers/categories.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/categories - Lista todas as categorias
router.get('/', categoriesController.getAll.bind(categoriesController));

// GET /api/categories/:id - Busca categoria por ID
router.get('/:id', categoriesController.getById.bind(categoriesController));

// POST /api/categories - Cria nova categoria
router.post('/', categoriesController.create.bind(categoriesController));

// PUT /api/categories/:id - Atualiza categoria
router.put('/:id', categoriesController.update.bind(categoriesController));

// DELETE /api/categories/:id - Exclui categoria
router.delete('/:id', categoriesController.delete.bind(categoriesController));

export default router;