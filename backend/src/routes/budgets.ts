import { Router } from 'express';
import budgetsController from '@/controllers/budgets.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Budget routes
router.get('/', budgetsController.getAll.bind(budgetsController));
router.get('/:id', budgetsController.getById.bind(budgetsController));
router.post('/', budgetsController.create.bind(budgetsController));
router.put('/:id', budgetsController.update.bind(budgetsController));
router.delete('/:id', budgetsController.delete.bind(budgetsController));
router.get('/:id/check', budgetsController.checkExceeded.bind(budgetsController));

// Budget Limits routes
router.post('/limits', budgetsController.createLimit.bind(budgetsController));
router.put('/limits/:id', budgetsController.updateLimit.bind(budgetsController));
router.delete('/limits/:id', budgetsController.deleteLimit.bind(budgetsController));

// Auto-Budget routes
router.post('/:id/auto-budget', budgetsController.setAutoBudget.bind(budgetsController));
router.delete('/:id/auto-budget', budgetsController.removeAutoBudget.bind(budgetsController));

export default router;
