// Push Notification Privilege
export enum PushNotificationPrivilege {
  ENABLE = 1,
}

// WebRTC Privileges
export enum WebRTCPrivilege {
  ENABLED = 1,
  CLICK_TO_CALL = 2,
  DIALPAD = 4,
  BARGIN = 8,
}

// Number Visibility Privilege
export enum NumberVisibilityPrivilege {
  ENABLE = 1,
}

// Recording Privilege
export enum RecordingPrivilege {
  PLAY = 1,
  DOWNLOAD = 2,
}

// Generic CRUD Privileges
export enum CRUDPrivilege {
  READ = 1,
  CREATE = 2,
  UPDATE = 4,
  DELETE = 8,
}

// Export/Import Privileges
export enum ExportImportPrivilege {
  USER = 1,
  CLIENT = 2,
  CALLS = 4,
  RECORDINGS = 8,
  CALL_TRAFFIC = 16,
  USER_ACTIVITY = 32,
  TRADE_EXCEPTION = 64,
}

// Call Queue Privilege
export enum CallQueuePrivilege {
  ENABLE = 1,
}

// Call Queue Privilege
export enum TaskPrivilege {
  FOLLOW_UP = 1,
}

// Filters Privileges
export enum FiltersPrivilege {
  SEARCH = 1,
  DATE = 2,
  STATUS = 4,
  TAGS = 8,
  BRANCH = 16,
  USERS = 32,
  DATE_PICKER = 64,
}

// Statistics Privileges
export enum StatisticsPrivilege {
  DEFAULT = 1,
  CHANNELS = 2,
}

// Remarks Privilege
export enum RemarksPrivilege {
  ENABLE = 1,
}

// Template Mapping Privilege
export enum TemplateMappingPrivilege {
  ENABLE = 1,
}

// Reports Privileges
export enum ReportsPrivilege {
  CALL_TRAFFIC = 1,
  USER_ACTIVITY = 2,
  TRADE_EXCEPTION = 4,
}

// Password Management Privileges
export enum PasswordPrivilege {
  CHANGE_PASSWORD = 1,
  RESET_PASSWORD = 2,
}

// Set privilege
export enum SetPrivilege {
  ENABLE = 1,
}

// Login type
export enum LOGIN_MODE {
  TRADITIONAL_AUTH = 1,
  SAML = 2,
}

// Global settings
export enum SettingsPrivilege {
  ENABLE = 1,
}

export const privilegeGroups = {
  pushNot: PushNotificationPrivilege,
  webrtc: WebRTCPrivilege,
  numVis: NumberVisibilityPrivilege,
  rec: RecordingPrivilege,
  clients: CRUDPrivilege,
  users: CRUDPrivilege,
  branch: CRUDPrivilege,
  tempMap: TemplateMappingPrivilege,
  priv: SetPrivilege,
  expImp: ExportImportPrivilege,
  callQue: CallQueuePrivilege,
  filters: FiltersPrivilege,
  stats: StatisticsPrivilege,
  remarks: RemarksPrivilege,
  reports: ReportsPrivilege,
  pass: PasswordPrivilege,
  settings: SettingsPrivilege,
  task: TaskPrivilege,
} as const;

export type PrivilegeKey = keyof typeof privilegeGroups;
export type PrivilegeValue =
  | PushNotificationPrivilege
  | WebRTCPrivilege
  | NumberVisibilityPrivilege
  | RecordingPrivilege
  | CRUDPrivilege
  | ExportImportPrivilege
  | CallQueuePrivilege
  | TaskPrivilege
  | FiltersPrivilege
  | StatisticsPrivilege
  | RemarksPrivilege
  | ReportsPrivilege
  | TemplateMappingPrivilege
  | SetPrivilege
  | PasswordPrivilege
  | LOGIN_MODE
  | SettingsPrivilege;

export function getPrivilegeName(privilege: string) {
  switch (privilege) {
    case "pushNot":
      return "Push Notifications";

    case "webrtc":
      return "WebRTC";

    case "numVis":
      return "Phone Number";

    case "rec":
      return "Recordings";

    case "clients":
      return "Clients";

    case "users":
      return "Users";

    case "branch":
      return "Branches";

    case "tempMap":
      return "Template Mapping";

    case "priv":
      return "Privilege";

    case "expImp":
      return "Export/Import";

    case "callQue":
      return "Call Queue";

    case "filters":
      return "Filters";

    case "stats":
      return "Stats";

    case "remarks":
      return "Remarks";

    case "reports":
      return "Reports";

    case "pass":
      return "Password";

    case "settings":
      return "Global Settings";

    case "task":
      return "Task";

    default:
      return "";
  }
}

export const DISABLE_PRIVILEGE = -1;

export function hasPrivilege(
  privilege: number,
  permission: PrivilegeValue
): boolean {
  if (privilege === DISABLE_PRIVILEGE) return false;
  return (privilege & permission) === permission;
}

// const privileges = {
//   pushNot: 0, // 0 or 1
//   webrtc: 1, // 0 or 1 (enabled), 2 (click to call), 4 (dialpad), 8 (bargin)
//   numVis: 0, // 0 or 1
//   rec: 0, // 0 or 1 (play)
//   clients: 0, // 0 or 1, 2, 4, 8 (RCUD)
//   users: 0, // 0 or 1, 2, 4, 8 (RCUD)
//   branch: 0, // 0 or 1, 2, 4, 8 (RCUD)
//   tempMap: 0, // 0 or 1
//   priv: 0, // 0 or 1
//   expImp: 0, // 0 or 1 (user), 2 (client), 4 (calls), 8 (recordings), 16 (call traffic)
//   callQue: 0, // 0 or 1
//   filters: 0, // 0 or 1 (search), 2 (date), 4 (status), 8 (tags), 16 (branch), 32 (users)
//   stats: 0, // 0 or 1 (total), 2 (active), 4 (incoming), 8 (outgoing), 16 (duration), 32 (active channels), 64 (peak channels)
//   remarks: 0, // 0 or 1
//   reports: 0, // 0 or 1 (call traffic)
//   pass: 0, // 0 or 1 (change password), 2 (change password to default), 4 (reset password)
//   settings: 1, // 0 or 1 (enable)
//   task: 1, // 0 or 1 (enable)
// };
