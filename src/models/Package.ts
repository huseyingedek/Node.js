import { Schema, model, Document } from 'mongoose';

export interface IPackage extends Document {
  name: 'Basic' | 'Premium';
  price: number;
  features: string[];
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Premium']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  features: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length > 0, 'At least one feature is required']
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  }
}, { timestamps: true });

export const Package = model<IPackage>('Package', packageSchema);