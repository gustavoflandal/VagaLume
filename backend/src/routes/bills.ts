import { Router } from 'express';
import billsController from '@/controllers/bills.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Rotas específicas devem vir ANTES das rotas com parâmetros dinâmicos
router.get('/upcoming', billsController.getUpcoming.bind(billsController));
router.get('/statistics', billsController.getStatistics.bind(billsController));
router.get('/installments/all', billsController.getAllInstallments.bind(billsController));

// Rotas de parcelas específicas
router.put('/installments/:id', billsController.updateInstallment.bind(billsController));
router.post('/installments/:id/pay', billsController.payInstallment.bind(billsController));
router.delete('/installments/:id', billsController.deleteInstallment.bind(billsController));

// Rotas gerais de bills
router.get('/', billsController.getAll.bind(billsController));
router.post('/', billsController.create.bind(billsController));
router.get('/:id', billsController.getById.bind(billsController));
router.put('/:id', billsController.update.bind(billsController));
router.delete('/:id', billsController.delete.bind(billsController));

// Rotas de ações específicas de uma bill
router.get('/:id/auto-match', billsController.autoMatch.bind(billsController));
router.post('/:id/link-transaction', billsController.linkTransaction.bind(billsController));
router.get('/:id/installments', billsController.getInstallments.bind(billsController));
router.post('/:id/regenerate-installments', billsController.regenerateInstallments.bind(billsController));

export default router;
