export interface ICryptoPrice {
    symbol: string;
    price: number;
    volume: number;
    timestamp: Date;
    priceChange24h: number;
    volumeChange24h: number;
}

export interface IAnalysis {
    symbol: string;
    prediction: {
        expectedPrice: number;
        confidenceScore: number;
        timeFrame: string;
    };
    technicalIndicators: {
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
    };
    trend: 'bullish' | 'bearish' | 'neutral';
}