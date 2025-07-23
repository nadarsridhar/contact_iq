import { z } from "zod";

export const templateFormSchema = z.object({
  TemplateType: z.string(),
  MappingTemplateId: z.string().min(1, "Template is required"),
});

export type TemplateMapping = z.infer<typeof templateFormSchema>;
