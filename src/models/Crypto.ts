import mongoose, { Schema, Document } from 'mongoose';
import { ICryptoPrice } from '../interfaces/ICrypto';

export interface ICryptoPriceDocument extends ICryptoPrice, Document {}

const CryptoPriceSchema: Schema = new Schema({
    symbol: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    volume: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    priceChange24h: { type: Number },
    volumeChange24h: { type: Number }
}, { timestamps: true });

export const CryptoPrice = mongoose.model<ICryptoPriceDocument>('CryptoPrice', CryptoPriceSchema);