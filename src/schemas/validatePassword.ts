import { z } from 'zod';

export const validatePasswordSchema = z.object({
  Password: z
    .string()
    .min(6, 'Current Password should be atleast 6 characters'),
});

export type ValidatePassword = z.infer<typeof validatePasswordSchema>;
