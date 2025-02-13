import Binance from 'node-binance-api';
import { User } from '../models/User';
import { IBinanceKeys } from '../interfaces/IUser';
import { AppError } from '../utils/errorHandler';

export class BinanceService {
    public static async saveApiKeys(userId: string, apiKeys: IBinanceKeys): Promise<void> {
        const user = await User.findById(userId).select('+binanceApiKey +binanceApiSecret');
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        if (user.binanceApiKey || user.binanceApiSecret) {
            throw new AppError(400, 'API keys are already set. Please delete existing keys first.');
        }

        if (!this.validateApiKeyFormat(apiKeys.apiKey) || !this.validateApiKeyFormat(apiKeys.apiSecret)) {
            throw new AppError(400, 'Invalid API key format');
        }

        user.binanceApiKey = apiKeys.apiKey;
        user.binanceApiSecret = apiKeys.apiSecret;

        await user.save();
    }

    public static async getApiKeys(userId: string): Promise<IBinanceKeys> {
        const user = await User.findById(userId).select('+binanceApiKey +binanceApiSecret');
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        if (!user.binanceApiKey || !user.binanceApiSecret) {
            throw new AppError(404, 'API keys not found');
        }

        return {
            apiKey: user.binanceApiKey,
            apiSecret: user.binanceApiSecret
        };
    }

    public static async deleteApiKeys(userId: string): Promise<void> {
        const user = await User.findById(userId).select('+binanceApiKey +binanceApiSecret');
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        if (!user.binanceApiKey && !user.binanceApiSecret) {
            throw new AppError(404, 'No API keys found to delete');
        }

        await User.findByIdAndUpdate(userId, {
            $unset: { 
                binanceApiKey: "", 
                binanceApiSecret: "" 
            }
        }, { 
            new: true,
            runValidators: false
        });
    }

    private static validateApiKeyFormat(key: string): boolean {
        // gercek binance api formatı olcak
        return key.length === 64 && /^[A-Za-z0-9]+$/.test(key);
    }

    public static async getPortfolio(userId: string): Promise<any> {

        const user = await User.findById(userId).select('+binanceApiKey +binanceApiSecret');
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const binance = new Binance().options({
            APIKEY: user.binanceApiKey,
            APISECRET: user.binanceApiSecret
        });

        try {
            const balances = await binance.balance();
            
            const portfolio = Object.entries(balances)
                .filter(([_, balance]: [string, any]) => parseFloat(balance.available) > 0 || parseFloat(balance.onOrder) > 0)
                .map(([asset, balance]: [string, any]) => ({
                    asset,
                    available: balance.available,
                    onOrder: balance.onOrder,
                    total: parseFloat(balance.available) + parseFloat(balance.onOrder)
                }));

            return portfolio;
        } catch (error) {
            throw new AppError(500, 'Error fetching portfolio from Binance');
        }
    }
}