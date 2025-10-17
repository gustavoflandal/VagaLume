import { Router } from 'express';
import transactionLinksController from '@/controllers/transactionLinks.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Link Types routes
router.get('/types', transactionLinksController.getAllTypes.bind(transactionLinksController));
router.get('/types/:id', transactionLinksController.getTypeById.bind(transactionLinksController));
router.post('/types', transactionLinksController.createType.bind(transactionLinksController));
router.put('/types/:id', transactionLinksController.updateType.bind(transactionLinksController));
router.delete('/types/:id', transactionLinksController.deleteType.bind(transactionLinksController));
router.post('/types/seed', transactionLinksController.seedDefaultTypes.bind(transactionLinksController));

// Transaction Links routes
router.get('/transaction/:transactionId', transactionLinksController.getByTransaction.bind(transactionLinksController));
router.post('/', transactionLinksController.createLink.bind(transactionLinksController));
router.delete('/:id', transactionLinksController.deleteLink.bind(transactionLinksController));

export default router;
