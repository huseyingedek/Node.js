import { Schema, Types, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../interfaces/IUser';
import { encrypt, decrypt } from '../utils/encryption';

const userSchema = new Schema<IUserDocument>({
   firstName: {
       type: String,
       required: [true, 'First name is required'],
       trim: true
   },
   lastName: {
       type: String,
       required: [true, 'Last name is required'],
       trim: true
   },
   email: {
       type: String,
       required: [true, 'Email is required'],
       unique: true,
       trim: true,
       lowercase: true,
       match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
   },
   number: {
       type: String,
       required: [true, 'Phone number is required'],
       unique: true,
       trim: true,
       match: [/^\d{11}$/, 'Please enter a valid phone number']
   },
   password: {
       type: String,
       required: [true, 'Password is required'],
       minlength: [6, 'Password must be at least 6 characters']
   },
   currentSubscription: {
       type: Types.ObjectId,
       ref: 'Subscription',
       default: null
   },
   binanceApiKey: {
       type: String,
       trim: true,
       select: false,
       set: function(value: string) {
           if (!value) return value;
           try {
               return encrypt(value);
           } catch (error) {
               console.error('Encryption error:', error);
               return value;
           }
       },
       get: function(value: string) {
           if (!value) return value;
           try {
               return decrypt(value);
           } catch (error) {
               console.error('Decryption error:', error);
               return value;
           }
       }
   },
   binanceApiSecret: {
       type: String,
       trim: true,
       select: false,
       set: function(value: string) {
           if (!value) return value;
           try {
               return encrypt(value);
           } catch (error) {
               console.error('Encryption error:', error);
               return value;
           }
       },
       get: function(value: string) {
           if (!value) return value;
           try {
               return decrypt(value);
           } catch (error) {
               console.error('Decryption error:', error);
               return value;
           }
       }
   }
}, {
   timestamps: true,
   toJSON: {
       transform(doc, ret) {
           ret.id = ret._id;
           delete ret._id;
           delete ret.password;
           delete ret.binanceApiKey;
           delete ret.binanceApiSecret;
           delete ret.__v;
       }
   }
});

// Password hashleme
userSchema.pre('save', async function(next) {
   if (!this.isModified('password')) return next();

   try {
       const salt = await bcrypt.genSalt(10);
       this.password = await bcrypt.hash(this.password, salt);
       next();
   } catch (error: any) {
       next(error);
   }
});

userSchema.post('save', function(doc) {
   if (doc.isModified('binanceApiKey') || doc.isModified('binanceApiSecret')) {
       console.log(`API keys modified for user ${doc._id} at ${new Date().toISOString()}`);
   }
});

userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
   return bcrypt.compare(password, this.password);
};

userSchema.methods.getDecryptedApiKeys = async function(): Promise<{apiKey: string, apiSecret: string}> {
   try {
       // Mevcut kullanıcı örneğini kullan
       if (!this.binanceApiKey || !this.binanceApiSecret) {
           const user = await User.findById(this._id)
               .select('+binanceApiKey +binanceApiSecret');
           
           if (!user?.binanceApiKey || !user?.binanceApiSecret) {
               throw new Error('API keys not found');
           }

           return {
               apiKey: user.binanceApiKey,
               apiSecret: user.binanceApiSecret
           };
       }

       return {
           apiKey: this.binanceApiKey,
           apiSecret: this.binanceApiSecret
       };
   } catch (error) {
       console.error('Error getting API keys:', error);
       throw new Error('Failed to get API keys');
   }
};

export const User = model<IUserDocument>('User', userSchema);