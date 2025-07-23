import { z } from "zod";

export const transferSchema = z.object({
  BranchName: z.string().min(1, "Branch should not be empty"),
  Agent: z.string(),
});

export type Transfer = z.infer<typeof transferSchema>;
