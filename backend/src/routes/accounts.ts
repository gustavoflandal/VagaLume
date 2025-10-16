import { Router } from 'express';
import accountsController from '@/controllers/accounts.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/accounts - Lista todas as contas
router.get('/', accountsController.getAll.bind(accountsController));

// GET /api/accounts/summary - Resumo das contas
router.get('/summary', accountsController.getSummary.bind(accountsController));

// GET /api/accounts/:id - Busca conta por ID
router.get('/:id', accountsController.getById.bind(accountsController));

// POST /api/accounts - Cria nova conta
router.post('/', accountsController.create.bind(accountsController));

// PUT /api/accounts/:id - Atualiza conta
router.put('/:id', accountsController.update.bind(accountsController));

// DELETE /api/accounts/:id - Exclui conta
router.delete('/:id', accountsController.delete.bind(accountsController));

export default router;