import { Inject, Injectable } from "@nestjs/common";
import type { Money } from "@ridenow/shared-types";
import {
  PAYMENT_PROVIDER,
  type Authorization,
  type PaymentProvider,
} from "./ports/payment-provider";

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider,
  ) {}

  authorize(amount: Money, reference: string): Promise<Authorization> {
    return this.payments.authorize(amount, reference);
  }

  capture(authorizationId: string): Promise<{ captured: true }> {
    return this.payments.capture(authorizationId);
  }
}
