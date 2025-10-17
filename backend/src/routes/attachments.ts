import { Router } from 'express';
import attachmentsController from '@/controllers/attachments.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', attachmentsController.getAll.bind(attachmentsController));
router.get('/entity/:type/:id', attachmentsController.getByEntity.bind(attachmentsController));
router.get('/statistics', attachmentsController.getStatistics.bind(attachmentsController));
router.get('/:id', attachmentsController.getById.bind(attachmentsController));
router.post('/', attachmentsController.create.bind(attachmentsController));
router.put('/:id', attachmentsController.update.bind(attachmentsController));
router.delete('/:id', attachmentsController.delete.bind(attachmentsController));
router.post('/:id/uploaded', attachmentsController.markAsUploaded.bind(attachmentsController));

export default router;
