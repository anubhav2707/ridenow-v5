import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RequestOtpSchema, VerifyOtpSchema } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("request-otp")
  requestOtp(@Body() body: unknown) {
    const parsed = RequestOtpSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.auth.requestOtp(parsed.data.phone);
  }

  @Post("verify-otp")
  verifyOtp(@Body() body: unknown) {
    const parsed = VerifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.auth.verifyOtp(parsed.data.phone, parsed.data.code);
  }
}
