import { z } from "zod";

export const callTrafficReport = z.object({
  ActiveCalls: z.number(),
  IncomingCalls: z.number(),
  MissedCalls: z.number(),
  OutgoingCalls: z.number(),
  TotalCallDuration: z.number(),
  TotalCalls: z.number(),
  CompletedCalls: z.number(),
  UserId: z.string(),
  UserName: z.string(),
  DistinctClient: z.string(),
  UnansweredCalls: z.number(),
  BranchName: z.number(),
});

export type CallTrafficReportSchema = z.infer<typeof callTrafficReport>;
