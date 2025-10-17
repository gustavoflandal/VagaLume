import { Router } from 'express';
import tagsController from '@/controllers/tags.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', tagsController.getAll.bind(tagsController));
router.get('/cloud', tagsController.getCloud.bind(tagsController));
router.get('/search', tagsController.search.bind(tagsController));
router.get('/statistics', tagsController.getStatistics.bind(tagsController));
router.get('/:id', tagsController.getById.bind(tagsController));
router.post('/', tagsController.create.bind(tagsController));
router.put('/:id', tagsController.update.bind(tagsController));
router.delete('/:id', tagsController.delete.bind(tagsController));
router.post('/:id/link', tagsController.linkToTransaction.bind(tagsController));
router.delete('/:id/unlink/:transactionId', tagsController.unlinkFromTransaction.bind(tagsController));

export default router;
