import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';
import { IAuthenticatedRequest, IUserDocument } from '../interfaces/IUser';
import { Subscription } from '../models/Subscription';

export class SubscriptionMiddleware {
   public static async checkSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
       try {
           const authenticatedReq = req as IAuthenticatedRequest;
           const user = authenticatedReq.user;

           if (!user) {
               throw new AppError(401, 'Authentication required');
           }

           if (!user.currentSubscription) {
               throw new AppError(403, 'Bu özelliği kullanmak için bir abonelik satın alın.');
           }

           const subscription = await Subscription.findById(user.currentSubscription);
           if (!subscription) {
               throw new AppError(404, 'Abonelik bulunamadı');
           }

           if (!subscription.isActive || subscription.endDate < new Date()) {
               throw new AppError(403, 'Aboneliğiniz sona ermiş veya aktif değil.');
           }

           if (subscription.type !== 'premium') {
               throw new AppError(403, 'Bu özellik sadece Premium kullanıcılar için geçerlidir.');
           }

           (authenticatedReq as any).subscription = subscription;

           next();
       } catch (error) {
           next(error);
       }
   }
}