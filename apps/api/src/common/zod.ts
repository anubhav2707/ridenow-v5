import { BadRequestException } from "@nestjs/common";
import type { ZodType } from "zod";

/** Parse an untrusted request body, surfacing failures as HTTP 400. */
export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException(result.error.issues);
  }
  return result.data;
}
