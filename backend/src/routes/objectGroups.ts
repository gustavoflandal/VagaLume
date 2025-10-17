import { Router } from 'express';
import objectGroupsController from '@/controllers/objectGroups.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', objectGroupsController.getAll.bind(objectGroupsController));
router.get('/:id', objectGroupsController.getById.bind(objectGroupsController));
router.post('/', objectGroupsController.create.bind(objectGroupsController));
router.put('/:id', objectGroupsController.update.bind(objectGroupsController));
router.delete('/:id', objectGroupsController.delete.bind(objectGroupsController));
router.post('/reorder', objectGroupsController.reorder.bind(objectGroupsController));

export default router;
