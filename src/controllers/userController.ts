import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { IAuthenticatedRequest } from '../interfaces/IUser';

export class UserController {
    public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as IAuthenticatedRequest).user.id;
            const updateData = req.body;

            const updatedUser = await UserService.updateUserProfile(userId, updateData);

            res.status(200).json({
                success: true,
                message: 'Profil başarıyla güncellendi',
                data: {
                    id: updatedUser.id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    number: updatedUser.number
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const user = await UserService.getProfile(req.user.id);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updateBinanceKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as IAuthenticatedRequest).user.id;
            const { apiKey, apiSecret } = req.body;

            await UserService.updateBinanceApiKeys(userId, { apiKey, apiSecret });

            res.status(200).json({
                success: true,
                message: 'Binance API anahtarları başarıyla güncellendi'
            });
        } catch (error) {
            next(error);
        }
    }
}