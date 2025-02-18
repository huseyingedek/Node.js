import express from 'express';
import { UserController } from '../controllers/userController';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

router.put('/profile', AuthMiddleware.authenticate, UserController.updateProfile);
router.get('/profile', AuthMiddleware.authenticate, UserController.getProfile
);
router.put('/binance-keys', AuthMiddleware.authenticate, UserController.updateBinanceKeys);

export default router;