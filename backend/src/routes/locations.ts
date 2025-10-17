import { Router } from 'express';
import locationsController from '@/controllers/locations.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/nearby', locationsController.findNearby.bind(locationsController));
router.get('/:id', locationsController.getById.bind(locationsController));
router.post('/', locationsController.upsert.bind(locationsController));
router.delete('/:id', locationsController.delete.bind(locationsController));

export default router;
