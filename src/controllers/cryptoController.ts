import { Request, Response, NextFunction } from 'express';
import { CryptoService } from '../services/cryptoService';
import { WebSocketService } from '../services/websocketService';
import { IAuthenticatedRequest, IUserDocument } from '../interfaces/IUser';
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

    public static async subscribeToPriceUpdates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as IUserDocument;
            const symbols = Array.isArray(req.query.symbols) 
                ? req.query.symbols as string[]
                : [req.params.symbol];

            const wsService = WebSocketService.getInstance();
            
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            symbols.forEach(symbol => {
                wsService.subscribeToSymbol(symbol, user.id);
                wsService.onPriceUpdate(symbol, user.id, (data) => {
                    res.write(`data: ${JSON.stringify(data)}\n\n`);
                });
            });

            req.on('close', () => {
                wsService.unsubscribeFromAllSymbols(user.id);
            });
        } catch (error) {
            next(error);
        }
    }
}