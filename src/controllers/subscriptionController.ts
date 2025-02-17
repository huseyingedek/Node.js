import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';

export class SubscriptionController {
    public static async purchaseSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { packageId } = req.body;
            const userId = req.user!.id.toString();

            await SubscriptionService.purchaseSubscription(userId, packageId);

            res.status(200).json({
                success: true,
                message: 'Abonelik başarıyla satın alındı.'
            });
        } catch (error) {
            next(error);
        }
    }

    public static async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { reason } = req.body;

            await SubscriptionService.cancelSubscription(userId, reason);

            res.status(200).json({
                success: true,
                message: 'Abonelik başarıyla iptal edildi.'
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getSubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const subscriptionDetails = await SubscriptionService.getSubscriptionDetails(userId);

            res.status(200).json({
                success: true,
                data: {
                    hasActiveSubscription: subscriptionDetails?.isActive || false,
                    subscription: subscriptionDetails
                }
            });
        } catch (error) {
            next(error);
        }
    }
}