export interface IBinanceTicker {
    symbol: string;
    lastPrice: string;
    volume: string;
    priceChange: string;
    prevVolume: string;
}

export interface IBinanceKline {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    trades: number;
    buyBaseVolume: string;
    buyQuoteVolume: string;
}