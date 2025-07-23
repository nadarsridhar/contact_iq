import { z } from "zod";

export const callTrafficClientDetailsReport = z.object({
  ActiveCalls: z.number(),
  ClientId: z.string(),
  ClientName: z.string(),
  IncomingCalls: z.number(),
  MissedCalls: z.number(),
  OutgoingCalls: z.number(),
  UnansweredCalls: z.number(),
  TotalCallDuration: z.number(),
  TotalCalls: z.number(),
  CompletedCalls: z.number(),
});

export type CallTrafficClientDetailsReportSchema = z.infer<
  typeof callTrafficClientDetailsReport
>;
