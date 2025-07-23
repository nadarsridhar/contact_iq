import { z } from "zod";

export const followupTaskSchema = z.object({
  TagId: z.number(),
  TaskType: z.number().optional(),
  Priority: z.number().optional(),
  Status: z.number().optional(),
  StartTime: z.number(),
  EndTime: z.number(),
  FollowUpTime: z.number(),
  UUID: z.string().optional(),
  UniqueCallIdentifier: z.string(),
  Title: z.string().min(1, `Title is required`),
  Description: z.string().min(1, `Description is required`),
  ClientId: z.string(),
  ClientName: z.string(),
  ClientNumber: z.string(),
  AttendedId: z.string(),
  AttendedName: z.string(),
  UserId: z.string(),
  UserName: z.string(),
  TemplateId: z.string().optional(),
  BranchName: z.string(),
  Reason: z.string().optional(),
  UpdatedBy: z.string(),
  AutoFlag: z.number().optional(),
  OperationCode: z.number(),
});

export type FollowupTask = z.infer<typeof followupTaskSchema>;
