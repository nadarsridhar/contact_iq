import { z } from "zod";

export const clientMasterSchema = z.object({
  ClientId: z
    .string()
    .min(1, "Client ID should not be empty")
    .max(16, "Client ID should not exceed 16 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Only alphanumeric characters with no spaces, underscores, and hyphens are allowed for client id.",
    }),
  ClientName: z
    .string()
    .min(1, "Client Name should not be empty")
    .max(50, "Client name should not exceed 50 characters"),
  ClientEmailId: z.string(),
  ClientNumber: z
    .string()
    .min(10, { message: "Number must be atleast 10 digits." })
    .max(10, { message: "Number must be atleast 10 digits." })
    .regex(/^\d*$/, {
      message: "Number must contain only numeric characters.",
    }),
  ClientAlternateNumber: z.string().optional(),
  Tpin: z.coerce
    .number()
    .int()
    .refine((value) => value === 0 || (value >= 1000 && value <= 9999), {
      message: "Tpin should be 4 digits number",
    }),
  BranchName: z.string().min(1, "Branch should not be empty"),
  PreferedAgentId1: z.string(),
  PreferedAgentId2: z.string(),
  PreferedAgentId3: z.string(),
  MappingTemplateId: z.string(),
  ActiveFlag: z.union([z.string(), z.number()]),
  CreatedDate: z.number(),
  LastUpdateDate: z.number(),
  IsDeleted: z.number(),
  WebRTCFlag: z.number().optional(),
  UpdatedBy: z.string().optional(),
});

export type ClientMaster = z.infer<typeof clientMasterSchema>;
