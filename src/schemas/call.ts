import { z } from "zod";

export const callSchema = z.object({
  AnsweredFlag: z.number(),
  BranchId: z.number(),
  BranchName: z.string(),
  CallStatus: z.number(),
  CallType: z.number(),
  ClientId: z.string().min(1, "Client Id cannot be empty"),
  ClientName: z.string(),
  ClientNumber: z.string(),
  CreatedDate: z.number(),
  DealerChannel: z.string(),
  DealerName: z.string().optional(),
  Duration: z.number(),
  EndTime: z.number(),
  Feedback: z.number(),
  LastUpdateDate: z.number(),
  RecordingName: z.string(),
  RecordingPath: z.string(),
  RecordingURL: z.string(),
  Remarks: z.string().max(100, "Remarks cannot exceed 100 characters"),
  SessionId: z.number(),
  StartTime: z.number(),
  TagId: z.number(),
  UniqueCallIdentifier: z.string(),
  UpdatedBy: z.string(),
  UserId: z.string(),
  UserNumber: z.string(),
  ValidUserList: z.string().array().optional(),
  WebRTCCall: z.number(),
  TaggedClientIds: z.string().optional(),
  IsFollowupScheduled: z.boolean().optional()
});

export const editCallSchema = z.object({
  ClientId: z.string(),
  Remarks: z.string(),
  TagId: z.number(),
});

export type Call = z.infer<typeof callSchema>;
