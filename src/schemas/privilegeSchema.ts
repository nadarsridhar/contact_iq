import { z } from "zod";

export const privilegeFormSchema = z.object({
  PrivilegeTemplateId: z.string().min(1, "Privilege template is required"),
  UserCategory: z.string().min(1, "User category is required"),
});

export type PrivilegeMapping = z.infer<typeof privilegeFormSchema>;
