import Binance from 'binance-api-node';
import { RSI, MACD } from 'technicalindicators';
import { CryptoPrice } from '../models/Crypto';
import { ICryptoPrice, IAnalysis } from '../interfaces/ICrypto';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';

export class CryptoService {
    private client: ReturnType<typeof Binance>;

    constructor(apiKey: string, apiSecret: string) {
        this.client = Binance({
            apiKey,
            apiSecret
        });
    }

    private static async initializeClient(userId: string) {
        const user = await User.findById(userId).select('+binanceApiKey +binanceApiSecret');
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        if (!user.binanceApiKey || !user.binanceApiSecret) {
            throw new AppError(404, 'Binance API keys not found');
        }

        return new CryptoService(user.binanceApiKey, user.binanceApiSecret);
    }

    public static async getCurrentPrice(userId: string, symbol: string): Promise<ICryptoPrice> {
        const service = await this.initializeClient(userId);
        
        try {
            const [ticker, volumeChange] = await Promise.all([
                service.client.dailyStats({ symbol }),
                service.getVolumeChange(symbol)
            ]);

            if (!ticker || Array.isArray(ticker)) {
                throw new AppError(500, 'Invalid response from Binance API');
            }

            const priceData = await CryptoPrice.create({
                symbol,
                price: Number(ticker.lastPrice),
                volume: Number(ticker.volume),
                priceChange24h: Number(ticker.priceChange),
                volumeChange24h: volumeChange
            });

            return priceData;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new AppError(500, `Failed to fetch price data: ${error.message}`);
            }
            throw new AppError(500, 'An unknown error occurred while fetching price data');
        }
    }

    private async getVolumeChange(symbol: string): Promise<number> {
        try {
            const klines = await this.client.candles({
                symbol,
                interval: '1d',
                limit: 2
            });

            if (klines.length < 2) {
                return 0;
            }

            const previousVolume = Number(klines[0].volume);
            const currentVolume = Number(klines[1].volume);

            const changePercentage = ((currentVolume - previousVolume) / previousVolume) * 100;

            return changePercentage;
        } catch (error) {
            console.error('Error calculating volume change:', error);
            return 0;
        }
    }

    private async calculateTechnicalIndicators(prices: number[]): Promise<{rsi: number, macd: any}> {
        const rsiInput = {
            values: prices,
            period: 14
        };
        const rsiValues = RSI.calculate(rsiInput);
        const currentRSI = rsiValues[rsiValues.length - 1];

        const macdInput = {
            values: prices,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        };
        const macdValues = MACD.calculate(macdInput);
        const currentMACD = macdValues[macdValues.length - 1];

        return {
            rsi: currentRSI,
            macd: currentMACD
        };
    }

    private determineTrend(rsi: number, macd: any): 'bullish' | 'bearish' | 'neutral' {
        if (rsi > 70 && macd.histogram < 0) return 'bearish';
        if (rsi < 30 && macd.histogram > 0) return 'bullish';
        return 'neutral';
    }

    public static async getAnalysis(userId: string, symbol: string): Promise<IAnalysis> {
        const service = await this.initializeClient(userId);

        try {
            const klines = await service.client.candles({
                symbol: symbol,
                interval: '1d',
                limit: 100
            });

            const closePrices = klines.map(candle => Number(candle.close));
            
            const indicators = await service.calculateTechnicalIndicators(closePrices);
            
            const trend = service.determineTrend(indicators.rsi, indicators.macd);

            const currentPrice = closePrices[closePrices.length - 1];

            return {
                symbol,
                prediction: {
                    expectedPrice: currentPrice * (trend === 'bullish' ? 1.05 : trend === 'bearish' ? 0.95 : 1),
                    confidenceScore: Math.abs(50 - indicators.rsi) / 50,
                    timeFrame: '24h'
                },
                technicalIndicators: {
                    rsi: indicators.rsi,
                    macd: {
                        value: indicators.macd.MACD,
                        signal: indicators.macd.signal,
                        histogram: indicators.macd.histogram
                    }
                },
                trend: trend
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new AppError(500, `Analysis failed: ${error.message}`);
            }
            throw new AppError(500, 'An unknown error occurred during analysis');
        }
    }
}