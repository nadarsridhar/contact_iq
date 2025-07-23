import { z } from "zod";

export const userActivityReport = z.object({
  UserId: z.string(),
  UserName: z.string(),
  BranchName: z.string(),
  LoggedInAddress: z.string(),
  LoggedInApp: z.string(),
  LoggedInTime: z.string(),
  LoggedOutTime: z.string(),
  UserCategory: z.number(),
  LoggedIn: z.number(),
});

export type UserActivityReportSchema = z.infer<typeof userActivityReport>;
