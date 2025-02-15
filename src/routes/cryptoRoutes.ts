import { Router } from 'express';
import { CryptoController } from '../controllers/cryptoController';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validate';

const router = Router();

router.get(
    '/price/:symbol',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateSymbol,
    ValidationMiddleware.validate,
    CryptoController.getCurrentPrice
);

router.get(
    '/analysis/:symbol',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateSymbol,
    ValidationMiddleware.validate,
    CryptoController.getAnalysis
);

router.get(
    '/price-updates/:symbol',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateSymbol,
    ValidationMiddleware.validate,
    CryptoController.subscribeToPriceUpdates
);

router.get(
    '/price-updates',
    AuthMiddleware.authenticate,
    CryptoController.subscribeToPriceUpdates
);

export default router;