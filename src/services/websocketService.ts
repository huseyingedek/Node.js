import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { AppError } from '../utils/errorHandler';

export class WebSocketService {
    private static instance: WebSocketService;
    private connections: Map<string, WebSocket>;
    private eventEmitter: EventEmitter;
    private reconnectAttempts: Map<string, number>;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    private readonly RECONNECT_INTERVAL = 3000;

    private constructor() {
        this.connections = new Map();
        this.eventEmitter = new EventEmitter();
        this.reconnectAttempts = new Map();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    private getConnectionKey(userId: string, symbol: string): string {
        return `${userId}_${symbol}`;
    }

    public subscribeToSymbols(userId: string, symbols: string[]): void {
        symbols.forEach(symbol => {
            this.subscribeToSymbol(symbol, userId);
        });
    }

    public subscribeToSymbol(symbol: string, userId: string): void {
        try {
            const connectionKey = this.getConnectionKey(userId, symbol);
            
            if (!this.connections.has(connectionKey)) {
                const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
                this.setupWebSocketHandlers(ws, symbol, userId);
                this.connections.set(connectionKey, ws);
                this.reconnectAttempts.set(connectionKey, 0);
            }
        } catch (error) {
            throw new AppError(500, 'Failed to subscribe to price updates');
        }
    }

    private setupWebSocketHandlers(ws: WebSocket, symbol: string, userId: string): void {
        const connectionKey = this.getConnectionKey(userId, symbol);

        ws.on('message', (data: string) => {
            const tickerData = JSON.parse(data);
            this.eventEmitter.emit(`price_update_${connectionKey}`, {
                symbol: symbol,
                price: parseFloat(tickerData.c),
                priceChange: parseFloat(tickerData.p),
                volume: parseFloat(tickerData.v),
                timestamp: new Date()
            });
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for ${symbol}:`, error);
            this.handleReconnect(symbol, userId);
        });

        ws.on('close', () => {
            console.log(`WebSocket connection closed for ${symbol}`);
            this.handleReconnect(symbol, userId);
        });
    }

    private handleReconnect(symbol: string, userId: string): void {
        const connectionKey = this.getConnectionKey(userId, symbol);
        const attempts = this.reconnectAttempts.get(connectionKey) || 0;

        if (attempts < this.MAX_RECONNECT_ATTEMPTS) {
            setTimeout(() => {
                console.log(`Attempting to reconnect ${symbol} (Attempt ${attempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);
                this.reconnectAttempts.set(connectionKey, attempts + 1);
                this.unsubscribeFromSymbol(symbol, userId);
                this.subscribeToSymbol(symbol, userId);
            }, this.RECONNECT_INTERVAL);
        } else {
            console.error(`Failed to reconnect ${symbol} after ${this.MAX_RECONNECT_ATTEMPTS} attempts`);
            this.eventEmitter.emit(`connection_failed_${connectionKey}`);
        }
    }

    public unsubscribeFromSymbol(symbol: string, userId: string): void {
        const connectionKey = this.getConnectionKey(userId, symbol);
        const ws = this.connections.get(connectionKey);
        
        if (ws) {
            ws.close();
            this.connections.delete(connectionKey);
            this.reconnectAttempts.delete(connectionKey);
            this.eventEmitter.removeAllListeners(`price_update_${connectionKey}`);
        }
    }

    public unsubscribeFromAllSymbols(userId: string): void {
        Array.from(this.connections.keys())
            .filter(key => key.startsWith(userId))
            .forEach(key => {
                const symbol = key.split('_')[1];
                this.unsubscribeFromSymbol(symbol, userId);
            });
    }

    public onPriceUpdate(symbol: string, userId: string, callback: (data: any) => void): void {
        const connectionKey = this.getConnectionKey(userId, symbol);
        this.eventEmitter.on(`price_update_${connectionKey}`, callback);
    }
}