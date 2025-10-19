import { Router } from 'express';
import recurrencesController from '@/controllers/recurrences.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', recurrencesController.getAll.bind(recurrencesController));
router.get('/:id', recurrencesController.getById.bind(recurrencesController));
router.post('/', recurrencesController.create.bind(recurrencesController));
router.put('/:id', recurrencesController.update.bind(recurrencesController));
router.delete('/:id', recurrencesController.delete.bind(recurrencesController));
router.get('/:id/next-occurrences', recurrencesController.getNextOccurrences.bind(recurrencesController));
router.post('/generate-all', recurrencesController.generateAll.bind(recurrencesController));

export default router;
