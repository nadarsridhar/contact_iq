import globalState from "./globalState";

export enum UserCategory {
  SUPER_ADMIN = 1,
  Agent = 2,
  BRANCH_ADMIN = 4,
  TEAM_MANAGER = 8,
}

export function getUserCategoryName(userCategory: UserCategory) {
  switch (userCategory) {
    case UserCategory.SUPER_ADMIN:
      return "Super Admin";

    case UserCategory.Agent:
      return globalState.AGENT_NAME;

    case UserCategory.BRANCH_ADMIN:
      return "Branch Admin";

    case UserCategory.TEAM_MANAGER:
      return "Team Manager";
  }
}
