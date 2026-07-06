import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("auth")
class AuthController {
  @Get()
  info(): StubInfo {
    return { module: "auth", status: "stub", story: "phone-OTP signup (rider + driver)" };
  }
}

/** Stub home for phone-OTP auth. Injects OTP_PROVIDER in its feature story. */
@Module({ controllers: [AuthController] })
export class AuthModule {}
