import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';
import { IUserDocument } from '../interfaces/IUser';

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}

export class AuthMiddleware {
    public static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                throw new AppError(401, 'Authentication required');
            }

            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new AppError(500, 'JWT_SECRET is not defined');
            }

            const decoded = jwt.verify(token, jwtSecret) as { id: string };
            
            const user = await User.findById(decoded.id);
            if (!user) {
                throw new AppError(401, 'User not found');
            }

            req.user = user;
            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new AppError(401, 'Invalid token'));
            } else {
                next(error);
            }
        }
    }
}