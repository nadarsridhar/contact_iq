export enum UIErrorCode {
  SUCCESS = 0,
  FAILURE = -1,
  InvalidCredential = 1,
  AlreadyExist = 2,
  NotExist = 3,
  BranchNotExist = 4,
  UserNotExist = 5,
  InvalidWebRTCFlag = 6,
  InvalidClientName = 7,
  InvalidUserName = 8,
  InvalidMobileNumber = 9,
  InvalidUserCategory = 10,
  UserNumberAlreadyExist = 11,
  InvalidPermission = 12,
  UpdatedByUserNotExist = 13,
  MappingNotExist = 14,
  DefaultPassword = 15,
  UserInactive = 16,
  MappingTemplateRequired = 17,
  InvalidClientId = 18,
  InvalidUserId = 19,
  InvalidJson = 20,
  PrivilegeTemplateRequired = 21,
  MaxAgentLoggedIn = 22,
  InvalidUploadFile = 23,
  PasswordExpired = 24,
  PasswordCannotBeSame = 25,
  InvalidTaggedClientId = 26,
  InternalServerError = 27,
  StartTimeIsGreaterThanEndTime = 28,
  TaskInProgess = 29,
  RequiredUserIdForFollowUpTime = 30,
  TaskCompleted = 31,
  AttendedUserNotFoundForCompletedStatus = 32,
  InvalidEmail = 33,
  EmailRequired = 34,
  InvalidBranchName = 35,
  InvalidUniqueCallIdentifier = 36,
  InvalidTaskType = 37,
  FollowupTimeShouldBeGreater = 38,
  InvalidTaskStatus = 39,
  InvalidPWExpireDays = 40,
  InvalidTaskTTL = 41,
  InvalidDefaultTPIN = 42,
  InvalidTEReportRetentionDays = 43,
}

// Branch error
export function getErrorForBranch(errorCode: UIErrorCode) {
  switch (errorCode) {
    case UIErrorCode.AlreadyExist:
      return `Branch already exists`;
  }
}

export function getErrorForUser(errorCode: UIErrorCode) {
  switch (errorCode) {
    case UIErrorCode.AlreadyExist:
      return `User already exists`;

    case UIErrorCode.PasswordCannotBeSame:
      return `New password cannot be same as current password`;
  }
}

export function getErrorForClient(errorCode: UIErrorCode) {
  switch (errorCode) {
    case UIErrorCode.AlreadyExist:
      return `Client already exists`;
  }
}

export function getErrorForCallLogs(errorCode: UIErrorCode) {
  switch (errorCode) {
    case UIErrorCode.NotExist:
      return `Call record doesn't exist`;
  }
}

export function getErrorForFollowUp(errorCode: UIErrorCode) {
  switch (errorCode) {
    case UIErrorCode.NotExist:
      return `Follow up id doesn't exist`;
  }
}
