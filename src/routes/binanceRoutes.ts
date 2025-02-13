import { Router } from 'express';
import { BinanceController } from '../controllers/binanceController';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validate';

const router = Router();

router.post(
    '/api-keys',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateApiKeys,
    BinanceController.saveApiKeys
);

router.get(
    '/api-keys',
    AuthMiddleware.authenticate,
    BinanceController.getApiKeys
);

router.delete(
    '/api-keys',
    AuthMiddleware.authenticate,
    BinanceController.deleteApiKeys
);

export default router;