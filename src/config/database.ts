import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
    private static instance: Database;
    private constructor() {}

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGODB_URI;
            if (!mongoUri) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }

            await mongoose.connect(mongoUri);
            console.log('Connected to MongoDB successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            process.exit(1);
        }
    }
}