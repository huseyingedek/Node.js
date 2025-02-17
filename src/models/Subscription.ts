import { Schema, model, Types, Document } from 'mongoose';

export interface ISubscription extends Document {
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

const subscriptionSchema = new Schema<ISubscription>({
    packageId: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['basic', 'premium'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    features: [{
        type: String,
        required: true
    }],
    cancelReason: {
        type: String
    },
    renewalDate: {
        type: Date
    },
    paymentHistory: [{
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['success', 'failed'],
            required: true
        },
        transactionId: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

subscriptionSchema.methods.checkIsActive = function(): boolean {
    return this.status === 'active' && this.endDate > new Date();
};

subscriptionSchema.methods.daysUntilExpiration = function(): number {
    const now = new Date();
    const diffTime = Math.abs(this.endDate.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);