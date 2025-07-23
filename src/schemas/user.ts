import { z } from "zod";
import globalState from "@/utils/globalState";

export const loginFormSchema = z.object({
  userId: z
    .string()
    .min(1, `${globalState.AGENT_NAME} ID should be atleast 1 character`)
    .max(12, `${globalState.AGENT_NAME} ID cannot exceed 12 characters`),
  password: z
    .string()
    .min(6, "Password should be atleast 6 characters")
    .max(25, "Password cannot exceed 25 characters"),
});

export const profileFormSchema = z.object({
  inputDevice: z.string(),
  outputDevice: z.string(),
});
