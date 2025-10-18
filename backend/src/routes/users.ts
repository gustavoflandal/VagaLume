import { Router } from 'express';
import usersController from '@/controllers/users.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/users/me/export - Exporta todos os dados do usuário (deve vir antes de /me)
router.get('/me/export', usersController.exportData.bind(usersController));

// GET /api/users/me - Retorna dados do usuário autenticado
router.get('/me', usersController.getMe.bind(usersController));

// PUT /api/users/me - Atualiza dados do usuário autenticado
router.put('/me', usersController.updateMe.bind(usersController));

// PUT /api/users/me/password - Altera senha do usuário
router.put('/me/password', usersController.changePassword.bind(usersController));

// DELETE /api/users/me - Desativa conta do usuário
router.delete('/me', usersController.deactivate.bind(usersController));

export default router;