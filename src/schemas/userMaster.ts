import { z } from "zod";
import globalState from "@/utils/globalState";
import { UserCategory } from "@/utils/userCategory";

export const userMasterSchema = z
  .object({
    UserId: z
      .string()
      .min(1, `${globalState.AGENT_NAME} ID should not be empty`)
      .max(16, `${globalState.AGENT_NAME} ID should not exceed 16 characters`)
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Only alphanumeric characters with no spaces, underscores, and hyphens are allowed for user id.",
      }),
    UserName: z
      .string()
      .min(1, `${globalState.AGENT_NAME}name should not be empty`)
      .max(50, `${globalState.AGENT_NAME}name should not exceed 50 characters`),
    UserCategory: z.union([z.string(), z.number()]),
    UserMobileNumber: z
      .string()
      .min(10, { message: "Number must be atleast 10 digits." })
      .max(10, { message: "Number must be atleast 10 digits." })
      .regex(/^\d*$/, {
        message: "Number must contain only numeric characters.",
      }),
    UserAlternateMobileNumber: z.string().optional(),
    CompanyName: z.string(),
    WebRTCFlag: z.union([z.string(), z.number()]),
    Pin: z.coerce.number().int(),
    UserEmailId: z.string(),
    LoggedIn: z.number().optional(),
    LoginMode: z.union([z.string(), z.number()]),
    ActiveFlag: z.union([z.string(), z.number()]),
    CallMode: z.union([z.string(), z.number()]),
    UserStatus: z.union([z.string(), z.number()]),
    BranchName: z.string().optional(),
    MappingTemplateId: z.string().optional(),
    PrivilegeTemplateId: z.string().min(1, `Privilege template is required`),
    WorkingHoursTemplateId: z.string(),
    AllowedIP: z.string().optional(),
    CreatedDate: z.number().optional(),
    LastUpdateDate: z.number().optional(),
    IsDeleted: z.number(),
    UpdatedBy: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Branch is required other than Super Admin
    const userCategory = Number(data.UserCategory);
    if (
      ![UserCategory.SUPER_ADMIN].includes(userCategory) &&
      !data.BranchName
    ) {
      ctx.addIssue({
        path: ["BranchName"],
        message: "Branch is required",
      });
    }

    // Mapping template required for branch admin and team manager
    if (
      [UserCategory.BRANCH_ADMIN, UserCategory.TEAM_MANAGER].includes(
        userCategory
      ) &&
      !data.MappingTemplateId
    ) {
      ctx.addIssue({
        path: ["MappingTemplateId"],
        message: "Mapping Template is required",
      });
    }
  });

export type UserMaster = z.infer<typeof userMasterSchema>;
