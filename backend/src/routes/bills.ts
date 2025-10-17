import { Router } from 'express';
import billsController from '@/controllers/bills.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', billsController.getAll.bind(billsController));
router.get('/upcoming', billsController.getUpcoming.bind(billsController));
router.get('/statistics', billsController.getStatistics.bind(billsController));
router.get('/:id', billsController.getById.bind(billsController));
router.post('/', billsController.create.bind(billsController));
router.put('/:id', billsController.update.bind(billsController));
router.delete('/:id', billsController.delete.bind(billsController));
router.get('/:id/auto-match', billsController.autoMatch.bind(billsController));
router.post('/:id/link-transaction', billsController.linkTransaction.bind(billsController));

export default router;
