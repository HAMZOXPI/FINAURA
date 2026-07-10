export type BoostPaymentProviderName = "fake" | "stripe";

export type BoostPaymentStatus = "pending" | "succeeded" | "failed" | "cancelled";

export interface BoostCheckoutIntent {
  checkoutId: string;
  userId: string;
  listingId: string;
  productId: string;
  position: number;
  amount: number;
  listingTitle: string;
  productName: string;
  expiresAt: string;
}

export interface BoostCheckoutPreview {
  checkoutId: string;
  listingId: string;
  listingTitle: string;
  productName: string;
  position: number;
  amount: number;
  expiresAt: string;
}

export interface BoostPaymentConfirmation {
  success: true;
  providerPaymentId: string;
}

export interface BoostPaymentFailure {
  success: false;
  error: string;
}

export type BoostPaymentResult = BoostPaymentConfirmation | BoostPaymentFailure;

export interface BoostPaymentProvider {
  readonly name: BoostPaymentProviderName;
  confirmPayment(checkoutId: string, userId: string): Promise<BoostPaymentResult>;
}
