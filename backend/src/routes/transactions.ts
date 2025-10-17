import { Router } from 'express';
import transactionsController from '@/controllers/transactions.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate, createTransactionSchema, updateTransactionSchema } from '@/middleware/validation.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/transactions/summary - Resumo financeiro
router.get('/summary', transactionsController.getSummary.bind(transactionsController));

// GET /api/transactions - Lista transações com filtros
router.get('/', transactionsController.getAll.bind(transactionsController));

// GET /api/transactions/:id - Busca transação por ID
router.get('/:id', transactionsController.getById.bind(transactionsController));

// POST /api/transactions - Cria nova transação
router.post('/', validate(createTransactionSchema), transactionsController.create.bind(transactionsController));

// PUT /api/transactions/:id - Atualiza transação
router.put('/:id', validate(updateTransactionSchema), transactionsController.update.bind(transactionsController));

// DELETE /api/transactions/:id - Exclui transação
router.delete('/:id', transactionsController.delete.bind(transactionsController));

export default router;