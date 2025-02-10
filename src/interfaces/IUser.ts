import { Document } from 'mongoose';

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    token?: string;
}