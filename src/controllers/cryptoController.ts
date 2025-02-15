import { Request, Response, NextFunction } from 'express';
import { CryptoService } from '../services/cryptoService';
import { AppError } from '../utils/errorHandler';

export class CryptoController {
    public static async getCurrentPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { symbol } = req.params;
            if (!req.user) {
                throw new AppError(401, 'User not authenticated');
            }

            const priceData = await CryptoService.getCurrentPrice(req.user.id, symbol);

            res.status(200).json({
                success: true,
                data: priceData
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { symbol } = req.params;
            if (!req.user) {
                throw new AppError(401, 'User not authenticated');
            }

            const analysis = await CryptoService.getAnalysis(req.user.id, symbol);

            res.status(200).json({
                success: true,
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }
}