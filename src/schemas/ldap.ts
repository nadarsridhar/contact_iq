import { z } from 'zod';

export const ldapSchema = z.object({
  UserName: z.string(),
  Password: z.string(),
  EndPoint: z.string(),
});

export type Ldap = z.infer<typeof ldapSchema>;
