import { User } from '../models/User';
import { Package } from '../models/Package';
import { Subscription } from '../models/Subscription';
import { AppError } from '../utils/errorHandler';
import { Types } from 'mongoose';

export class SubscriptionService {
  public static async purchaseSubscription(userId: string, packageId: string): Promise<void> {

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      throw new AppError(404, 'Package not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }


    if (user.currentSubscription) {
      const currentSubscription = await Subscription.findById(user.currentSubscription);
      if (currentSubscription && currentSubscription.isActive && currentSubscription.endDate > new Date()) {
        throw new AppError(400, 'User already has an active subscription');
      }
    }


    const subscription = await Subscription.create({
      packageId: new Types.ObjectId(packageId),
      userId: new Types.ObjectId(userId),
      type: selectedPackage.name.toLowerCase(),
      price: selectedPackage.price,
      startDate: new Date(),
      endDate: new Date(Date.now() + selectedPackage.duration * 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'active',
      features: selectedPackage.features,
      paymentHistory: [{
        amount: selectedPackage.price,
        date: new Date(),
        status: 'success',
        transactionId: Date.now().toString() // canlıda payment provider'dan gelecek
      }]
    });


    user.currentSubscription = subscription._id;
    if (!user.subscriptionHistory) {
      user.subscriptionHistory = [];
    }
    user.subscriptionHistory.push(subscription._id);

    await user.save();
  }

  public static async cancelSubscription(userId: string, reason?: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user?.currentSubscription) {
      throw new AppError(404, 'No active subscription found');
    }

    const subscription = await Subscription.findById(user.currentSubscription);
    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    subscription.isActive = false;
    subscription.status = 'cancelled';
    subscription.cancelReason = reason;
    await subscription.save();
  }

  public static async getSubscriptionDetails(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (!user.currentSubscription) {
      return null;
    }

    const subscription = await Subscription.findById(user.currentSubscription)
      .populate('packageId');

    return subscription;
  }

  public static async checkSubscriptionStatus(subscriptionId: string): Promise<boolean> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return false;

    return subscription.isActive && subscription.status === 'active' && subscription.endDate > new Date();
  }
}