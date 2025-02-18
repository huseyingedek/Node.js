import { Request, Response, NextFunction } from 'express';
import { PremiumService } from '../services/premiumService';
import { IAuthenticatedRequest } from '../interfaces/IUser';

export class PremiumController {
    public static async analyzeCoin(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;
            const user = (req as IAuthenticatedRequest).user;

            const analysis = await PremiumService.getSingleCoinAnalysis(
                symbol.toUpperCase() + 'USDT',
                user
            );

            res.status(200).json({
                success: true,
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }
}