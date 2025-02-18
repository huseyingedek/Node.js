import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import { IUserDocument, IUserResponse } from '../interfaces/IUser';
import bcrypt from 'bcrypt';

export class UserService {
    public static async updateUserProfile(userId: string, updateData: {
        firstName?: string;
        lastName?: string;
        number?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<IUserDocument> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, 'Kullanıcı bulunamadı');
        }

        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await User.findOne({ email: updateData.email });
            if (existingUser) {
                throw new AppError(400, 'Bu email adresi zaten kullanımda');
            }
            user.email = updateData.email;
        }

        if (updateData.currentPassword && updateData.newPassword) {
            const isPasswordValid = await user.comparePassword(updateData.currentPassword);
            if (!isPasswordValid) {
                throw new AppError(400, 'Mevcut şifre yanlış');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(updateData.newPassword, salt);
            user.password = hashedPassword;
        }

        if (updateData.firstName) user.firstName = updateData.firstName;
        if (updateData.lastName) user.lastName = updateData.lastName;
        if (updateData.number) user.number = updateData.number;

        await user.save();
        return user;
    }

    public static async getProfile(userId: string): Promise<IUserResponse> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            number: user.number,
            email: user.email
        };
    }

    public static async updateBinanceApiKeys(userId: string, apiKeys: {
        apiKey: string;
        apiSecret: string;
    }): Promise<IUserDocument> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, 'Kullanıcı bulunamadı');
        }

        user.binanceApiKey = apiKeys.apiKey;
        user.binanceApiSecret = apiKeys.apiSecret;

        await user.save();
        return user;
    }
}