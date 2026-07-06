import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("payments")
class PaymentsController {
  @Get()
  info(): StubInfo {
    return { module: "payments", status: "stub", story: "Stripe test-mode card payment" };
  }
}

/** Stub home for payments. Injects PAYMENT_PROVIDER in its feature story. */
@Module({ controllers: [PaymentsController] })
export class PaymentsModule {}
