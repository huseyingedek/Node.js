import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IUser, IUserLogin, IUserResponse } from '../interfaces/IUser';
import { AppError } from '../utils/errorHandler';

export class AuthService {
    private static generateToken(userId: string): string {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError(500, 'JWT_SECRET is not defined');
        }

        return jwt.sign({ id: userId }, jwtSecret, {
            expiresIn: '1d'
        });
    }

    public static async register(userData: IUser): Promise<IUserResponse> {

        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new AppError(400, 'Email already exists');
        }

        const user = await User.create(userData);

        const token = this.generateToken(user.id);

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            number: user.number,
            email: user.email,
            token
        };
    }

    public static async login(loginData: IUserLogin): Promise<IUserResponse> {

        const user = await User.findOne({ email: loginData.email });
        if (!user) {
            throw new AppError(401, 'Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(loginData.password);
        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        const token = this.generateToken(user.id);

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            number: user.number,
            email: user.email,
            token
        };
    }

    
}