import { Document } from 'mongoose';

export interface IUser {
    firstName: string;
    lastName: string;
    number: string;
    email: string;
    password: string;
    binanceApiKey?: string;
    binanceApiSecret?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
    getDecryptedApiKeys(): Promise<{apiKey: string, apiSecret: string}>;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    number: string;
    email: string;
    token?: string;
}

export interface IAuthenticatedRequest extends Request {
    on(arg0: string, arg1: () => void): unknown;
    params: { symbol: any; };
    user: IUserDocument;
}

export interface IBinanceKeys {
    apiKey: string;
    apiSecret: string;
}