export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ErrorHandler {
    public static handle(error: Error, statusCode: number = 500): AppError {
        if (error instanceof AppError) {
            return error;
        }

        return new AppError(
            statusCode,
            error.message || 'Internal Server Error',
            true
        );
    }
}