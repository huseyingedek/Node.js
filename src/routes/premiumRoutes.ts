import express from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { SubscriptionMiddleware } from '../middleware/checkSubscription';
import { PremiumController } from '../controllers/premiumController';

const router = express.Router();

router.get('/coin-analysis/:symbol', 
    AuthMiddleware.authenticate, 
    SubscriptionMiddleware.checkSubscription, 
    PremiumController.analyzeCoin
);

export default router;