export interface ITotalRecords {
  Result: number;
  TotalRecord: number;
}

export interface ICallFilter {
  key: string;
  value: { CallStatus: number; CallType: number };
}

export interface IReportType {
  key: string;
  value: number;
}

export interface ITagFilter {
  key: string;
  value: number;
}

export interface IExportCallRequestPayload {
  UserId: string;
  SearchText: string;
  BranchName: string;
  UserIds: string;
  CallStatus: number;
  CallType: number;
  StartTime: number;
  EndTime: number;
  TagId: number;
}

// Branches paylaod
export interface IGetBranchRequestPayload {
  UserId: string;
  RecordsPerPage: number;
  SearchText: string;
  BranchName: string;
  StartIndex: number;
}

export interface IDeleteBranchRequestPayload {
  BranchId: number;
}

// Users payload
export interface IGetUserRequestPayload {
  LoginId: string;
  UserCategory: number;
  StartIndex: number;
  RecordsPerPage: number;
  UserId: string;
  BranchName: string;
  SearchText: string;
  LoggedInUsers?: number;
}

export interface IDeleteUserRequestPayload {
  UserId: string;
  LoginId: string;
  IsDeleted: number;
}

export interface IExportUserRequestPayload {
  SearchText: string;
  UserCategory: number;
  LoginId: string;
  UserId: string;
  BranchName: string;
  LoggedInUsers?: number;
}

// Clients payload
export interface IGetClientRequestPayload {
  RecordsPerPage: number;
  SearchText: string;
  StartIndex: number;
  BranchName: string;
}

export interface IDeleteClientRequestPayload {
  LoginId: string;
  ClientId: string;
  IsDeleted: number;
}

// Template payload
export interface IGetTemplateIdsPayload {
  TemplateType: number;
}

export interface IExportClientRequestPayload {
  UserId: string;
  SearchText: string;
  BranchName: string;
}

export interface IAdminStats {
  ActiveCalls: number;
  IncomingCalls: number;
  OutgoingCalls: number;
  TotalCallDuration: number;
  TotalCalls: number;
}

export interface ICallDetails {
  AnsweredFlag: number;
  BranchId: number;
  BranchName: string;
  CallStatus: number;
  CallType: number;
  ClientId: string;
  ClientName: string;
  ClientNumber: string;
  CreatedDate: number;
  DealerChannel: string;
  Duration: number;
  EndTime: number;
  Feedback: number;
  IsDialpadCall: number;
  LastUpdateDate: number;
  RecordingName: string;
  RecordingPath: string;
  RecordingURL: string;
  Remarks: string;
  SessionId: number;
  StartTime: number;
  TagId: number;
  UniqueCallIdentifier: string;
  UpdatedBy: string;
  UserId: string;
  UserName: string;
  UserNumber: string;
  ValidUserList: string[];
  WebRTCCall: number;
}
