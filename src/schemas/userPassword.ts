import { z } from 'zod';

export const userPasswordSchema = z
  .object({
    CurrentPassword: z
      .string()
      .min(6, 'Current Password should be atleast 6 characters'),
    NewPassword: z
      .string()
      .min(6, 'New Password should be atleast 6 characters'),
    ConfirmNewPassword: z.string(),
  })
  .refine((data) => data.NewPassword === data.ConfirmNewPassword, {
    message: 'Password do not match.',
    path: ['ConfirmNewPassword'],
  });

export type UserMaster = z.infer<typeof userPasswordSchema>;
