import { Router } from 'express';
import piggyBanksController from '@/controllers/piggyBanks.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', piggyBanksController.getAll.bind(piggyBanksController));
router.get('/statistics', piggyBanksController.getStatistics.bind(piggyBanksController));
router.get('/:id', piggyBanksController.getById.bind(piggyBanksController));
router.post('/', piggyBanksController.create.bind(piggyBanksController));
router.put('/:id', piggyBanksController.update.bind(piggyBanksController));
router.delete('/:id', piggyBanksController.delete.bind(piggyBanksController));
router.post('/:id/add-money', piggyBanksController.addMoney.bind(piggyBanksController));
router.post('/:id/remove-money', piggyBanksController.removeMoney.bind(piggyBanksController));

export default router;
