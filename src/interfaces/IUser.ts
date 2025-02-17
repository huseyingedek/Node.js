import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser {
   firstName: string;
   lastName: string;
   number: string;
   email: string;
   password: string;
   binanceApiKey?: string;
   binanceApiSecret?: string;
   currentSubscription?: Types.ObjectId;
   subscriptionHistory?: Types.ObjectId[];
   createdAt?: Date;
   updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
   comparePassword(password: string): Promise<boolean>;
   getDecryptedApiKeys(): Promise<{ apiKey: string, apiSecret: string }>;
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
   currentSubscription?: ISubscription;
}

export interface IAuthenticatedRequest extends Request {
   user: IUserDocument;
   subscription?: ISubscription;
   params: { 
       symbol: any;
       [key: string]: any; 
   };
}

export interface IBinanceKeys {
   apiKey: string;
   apiSecret: string;
}

export interface ISubscription {
   _id: Types.ObjectId;
   packageId: Types.ObjectId;
   userId: Types.ObjectId;
   type: 'basic' | 'premium';
   price: number;
   startDate: Date;
   endDate: Date;
   isActive: boolean;
   status: 'active' | 'expired' | 'cancelled';
   features: string[];
   cancelReason?: string;
   renewalDate?: Date;
   paymentHistory: {
       amount: number;
       date: Date;
       status: 'success' | 'failed';
       transactionId: string;
   }[];
}

export interface IPackage extends Document {
   name: 'Basic' | 'Premium';
   price: number;
   features: string[];
   duration: number;
   createdAt: Date;
   updatedAt: Date;
}

declare global {
   namespace Express {
       interface Request {
           user?: IUserDocument;
           subscription?: ISubscription;
       }
   }
}