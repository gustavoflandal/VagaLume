import { Router } from 'express';
import settingsController from '@/controllers/settings.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/settings - Retorna configurações do usuário
router.get('/', settingsController.getSettings.bind(settingsController));

// PUT /api/settings - Atualiza configurações do usuário
router.put('/', settingsController.updateSettings.bind(settingsController));

// POST /api/settings/reset - Reseta configurações para valores padrão
router.post('/reset', settingsController.resetSettings.bind(settingsController));

export default router;
