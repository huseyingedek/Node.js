import { Request, Response, NextFunction } from 'express';
import { BinanceService } from '../services/binanceService';
import { IBinanceKeys } from '../interfaces/IUser';

export class BinanceController {
    public static async saveApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const apiKeys: IBinanceKeys = {
                apiKey: req.body.apiKey,
                apiSecret: req.body.apiSecret
            };

            await BinanceService.saveApiKeys(req.user.id, apiKeys);

            res.status(200).json({
                success: true,
                message: 'API keys saved successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const keys = await BinanceService.getApiKeys(req.user.id);

            res.status(200).json({
                success: true,
                data: keys
            });
        } catch (error) {
            next(error);
        }
    }

    public static async deleteApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            await BinanceService.deleteApiKeys(req.user.id);

            res.status(200).json({
                success: true,
                message: 'API keys deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const portfolio = await BinanceService.getPortfolio(req.user.id);

            res.status(200).json({
                success: true,
                data: portfolio
            });
        } catch (error) {
            next(error);
        }
    }
}