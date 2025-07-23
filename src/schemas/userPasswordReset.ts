import { z } from "zod";

export const userResetPasswordSchema = z.object({
  UserId: z.string(),
  Password: z
    .string()
    .min(6, "Current Password should be atleast 6 characters"),
});

export type UserResetPassword = z.infer<typeof userResetPasswordSchema>;
