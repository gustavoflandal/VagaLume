import { Router } from 'express';
import authController from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', authController.register.bind(authController));

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', authController.login.bind(authController));

/**
 * @route   POST /api/auth/refresh
 * @desc    Atualizar access token usando refresh token
 * @access  Public
 */
router.post('/refresh', authController.refresh.bind(authController));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (revoga refresh token)
 * @access  Public
 */
router.post('/logout', authController.logout.bind(authController));

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário autenticado
 * @access  Private
 */
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
