import { Router } from 'express';
import webhooksController from '@/controllers/webhooks.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', webhooksController.getAll.bind(webhooksController));
router.get('/statistics', webhooksController.getStatistics.bind(webhooksController));
router.get('/:id', webhooksController.getById.bind(webhooksController));
router.post('/', webhooksController.create.bind(webhooksController));
router.put('/:id', webhooksController.update.bind(webhooksController));
router.delete('/:id', webhooksController.delete.bind(webhooksController));
router.post('/:id/test', webhooksController.test.bind(webhooksController));
router.post('/:id/retry', webhooksController.retry.bind(webhooksController));
router.get('/:id/history', webhooksController.getHistory.bind(webhooksController));
router.post('/process-pending', webhooksController.processPending.bind(webhooksController));

export default router;
