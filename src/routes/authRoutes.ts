import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validate';

const router = Router();

router.post(
    '/register',
    ValidationMiddleware.validateRegister,
    AuthController.register
);

router.post(
    '/login',
    ValidationMiddleware.validateLogin,
    AuthController.login
);

router.get(
    '/profile',
    AuthMiddleware.authenticate,
    AuthController.getProfile
);

export default router;