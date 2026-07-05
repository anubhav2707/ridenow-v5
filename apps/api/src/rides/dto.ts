import { z } from "zod";
import { LngLatSchema } from "@ridenow/shared-types";

export const QuoteRequestSchema = z.object({
  pickup: LngLatSchema,
  dropoff: LngLatSchema,
});
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const StartRequestSchema = z.object({
  otp: z.string().min(1),
});
export type StartRequest = z.infer<typeof StartRequestSchema>;
