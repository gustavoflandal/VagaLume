import { Router } from 'express';
import rulesController from '@/controllers/rules.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Rule Groups routes
router.get('/groups', rulesController.getAllGroups.bind(rulesController));
router.get('/groups/:id', rulesController.getGroupById.bind(rulesController));
router.post('/groups', rulesController.createGroup.bind(rulesController));
router.put('/groups/:id', rulesController.updateGroup.bind(rulesController));
router.delete('/groups/:id', rulesController.deleteGroup.bind(rulesController));

// Rules routes
router.get('/:id', rulesController.getRuleById.bind(rulesController));
router.post('/', rulesController.createRule.bind(rulesController));
router.put('/:id', rulesController.updateRule.bind(rulesController));
router.delete('/:id', rulesController.deleteRule.bind(rulesController));
router.get('/:id/test', rulesController.testRule.bind(rulesController));
router.post('/:id/apply', rulesController.applyRule.bind(rulesController));

// Triggers routes
router.post('/triggers', rulesController.addTrigger.bind(rulesController));
router.delete('/triggers/:id', rulesController.removeTrigger.bind(rulesController));

// Actions routes
router.post('/actions', rulesController.addAction.bind(rulesController));
router.delete('/actions/:id', rulesController.removeAction.bind(rulesController));

export default router;
