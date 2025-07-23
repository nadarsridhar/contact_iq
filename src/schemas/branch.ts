import { z } from "zod";

export const branchSchema = z.object({
  BranchId: z.number(),
  BranchName: z
    .string()
    .min(1, "Branch should not be empty")
    .max(64, "Branch name cannot exceed 64 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Only alphanumeric characters with no spaces, underscores, and hyphens are allowed for branch name.",
    }),
  BranchAddress: z.string(),
  BranchCategory: z.union([z.string(), z.number()]),
  ActiveFlag: z.number().optional(),
  IsDeleted: z.number().optional(),
  CreatedDate: z.number().optional(),
  LastUpdateDate: z.number().optional(),
  UpdatedBy: z.string().optional(),
});

export type Branch = z.infer<typeof branchSchema>;
