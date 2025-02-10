import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { IUser, IUserLogin } from '../interfaces/IUser';

export class AuthController {
    public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData: IUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                number: req.body.number,
                email: req.body.email,
                password: req.body.password
            };

            const user = await AuthService.register(userData);

            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData: IUserLogin = {
                email: req.body.email,
                password: req.body.password
            };

            const user = await AuthService.login(loginData);

            res.status(200).json({
                success: true,
                data: user
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

            const user = await AuthService.getProfile(req.user.id);

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}