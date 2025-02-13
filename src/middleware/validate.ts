import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export class ValidationMiddleware {
    public static validateRegister: ValidationChain[] = [
        body('firstName')
            .trim()
            .notEmpty()
            .withMessage('First name is required')
            .isLength({ min: 2 })
            .withMessage('First name must be at least 2 characters'),

        body('lastName')
            .trim()
            .notEmpty()
            .withMessage('Last name is required')
            .isLength({ min: 2 })
            .withMessage('Last name must be at least 2 characters'),

        body('number')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .isLength({ min: 11 })
            .withMessage('Phone number must be at least 11 characters'),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    ];

    public static validateLogin: ValidationChain[] = [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
    ];

    public static validateApiKeys: ValidationChain[] = [
        body('apiKey')
            .trim()
            .notEmpty()
            .withMessage('API key is required')
            .isLength({ min: 64, max: 64 })
            .withMessage('API key must be exactly 64 characters')
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage('API key must contain only letters and numbers'),

        body('apiSecret')
            .trim()
            .notEmpty()
            .withMessage('API secret is required')
            .isLength({ min: 64, max: 64 })
            .withMessage('API secret must be exactly 64 characters')
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage('API secret must contain only letters and numbers')
    ];

    public static validateUpdateApiKeys: ValidationChain[] = [
        body('apiKey')
            .optional()
            .trim()
            .isLength({ min: 16, max: 64 })
            .withMessage('API key must be between 16 and 64 characters')
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage('API key must contain only letters and numbers'),

        body('apiSecret')
            .optional()
            .trim()
            .isLength({ min: 16, max: 64 })
            .withMessage('API secret must be between 16 and 64 characters')
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage('API secret must contain only letters and numbers')
    ];

    public static validate = (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.type === 'field' ? err.path : '',
                    message: err.msg
                }))
            });
        }
        next();
    };


}