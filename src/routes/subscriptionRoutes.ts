import express from 'express';
import { SubscriptionController } from '../controllers/subscriptionController';
import { AuthMiddleware } from '../middleware/auth';
import { SubscriptionMiddleware } from '../middleware/checkSubscription';

const router = express.Router();

router.post('/purchase', AuthMiddleware.authenticate, SubscriptionController.purchaseSubscription);
router.post('/cancel', AuthMiddleware.authenticate, SubscriptionController.cancelSubscription);
router.get('/status', AuthMiddleware.authenticate, SubscriptionController.getSubscriptionStatus);


router.use('/premium',
    AuthMiddleware.authenticate,
    SubscriptionMiddleware.checkSubscription,
);

export default router;