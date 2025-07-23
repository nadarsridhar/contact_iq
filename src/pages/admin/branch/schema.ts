import { z } from 'zod';

const userCategorySchema = z.object({
  id: z.string(),
  templateId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export type UserCategory = z.infer<typeof userCategorySchema>;
