import { z } from 'zod';

export const userCategorySchema = z.object({
  UserCategory: z.string(),
  UserCategoryName: z.string(),
});

export type UserCategory = z.infer<typeof userCategorySchema>;
