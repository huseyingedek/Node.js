import { AppError } from '../utils/errorHandler';
import { IUserDocument } from '../interfaces/IUser';
import Binance from 'binance-api-node';

interface BinanceError {
    message: string;
    code?: number;
}

export class PremiumService {
    public static async getSingleCoinAnalysis(symbol: string, user: IUserDocument) {
        try {
            let binanceKeys;
            
            try {
                binanceKeys = await user.getDecryptedApiKeys();
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Service Error:', error.message);
                } else {
                    console.error('Service Error:', error);
                }
                throw new AppError(403, 'Binance API anahtarlarınız eksik veya hatalı. Profil ayarlarından ekleyiniz.');
            }
    
            if (!binanceKeys.apiKey || !binanceKeys.apiSecret) {
                throw new AppError(403, 'Analiz yapmak için Binance API anahtarlarınızı kaydetmeniz gerekiyor.');
            }
    
            const client = Binance({
                apiKey: binanceKeys.apiKey,
                apiSecret: binanceKeys.apiSecret
            });
    
            console.log('Requesting Binance data for symbol:', symbol);
    
            let priceData, bookData;
            try {
                priceData = await client.prices({ symbol });
                bookData = await client.book({ symbol });
            } catch (binanceError: any) {
                console.error('Binance API Hatası:', binanceError.message);
                throw new AppError(400, `Binance API hatası: ${binanceError.message}`);
            }
    
            console.log('Successfully retrieved Binance data');
    
            const currentPrice = Number(priceData[symbol]);
    
            return {
                success: true,
                symbol,
                currentData: {
                    price: priceData[symbol],
                    orderBook: {
                        bids: bookData.bids.slice(0, 10),
                        asks: bookData.asks.slice(0, 10)
                    }
                },
                technicalAnalysis: {
                    trend: "BULLISH",
                    strength: 8.5,
                    supportLevels: [
                        { 
                            price: (currentPrice * 0.95).toFixed(2),
                            strength: "Strong" 
                        },
                        { 
                            price: (currentPrice * 0.93).toFixed(2),
                            strength: "Medium" 
                        }
                    ],
                    resistanceLevels: [
                        { 
                            price: (currentPrice * 1.05).toFixed(2),
                            strength: "Strong" 
                        },
                        { 
                            price: (currentPrice * 1.07).toFixed(2),
                            strength: "Weak" 
                        }
                    ]
                },
                predictions: {
                    shortTerm: {
                        direction: "UP",
                        targetPrice: (currentPrice * 1.03).toFixed(2),
                        confidence: 0.85,
                        timeFrame: "24h"
                    },
                    mediumTerm: {
                        direction: "UP",
                        targetPrice: (currentPrice * 1.05).toFixed(2),
                        confidence: 0.75,
                        timeFrame: "7d"
                    }
                },
                recommendations: [
                    "Güçlü alım fırsatı",
                    `Stop loss: ${(currentPrice * 0.95).toFixed(2)}`,
                    `İlk hedef: ${(currentPrice * 1.03).toFixed(2)}`
                ],
                riskLevel: "MEDIUM",
                lastUpdated: new Date()
            };
    
        } catch (error: any) {
            console.error('Service Error:', error.message);
            
            if (error instanceof AppError) {
                throw error;
            }
            
            throw new AppError(500, 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
    
    
}    