import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import mongoose from 'mongoose';

export class ErrorMiddleware {
    public static handle(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        console.error('Error:', error);

        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }

        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
            return;
        }

        if (error.name === 'MongoServerError' && (error as any).code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Duplicate field value entered'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}