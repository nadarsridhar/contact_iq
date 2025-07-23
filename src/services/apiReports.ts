import apiClient from "@/utils/apiClient";
import downloadFile from "@/utils/downloadFile";

export interface ICallTrafficReportPayload {
  UserId: string;
  SearchText: string;
  BranchName: string;
  StartIndex: number;
  RecordsPerPage: number;
  StartTime: number;
  EndTime: number;
}

export async function getCallTrafficReportApi(
  payload: ICallTrafficReportPayload
) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };

  try {
    const { data } = await apiClient.post(
      `/v1/admin/reports/callTraffic`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

interface IExportCallTrafficPayload {
  SearchText: string;
  UserId: string;
  StartTime: number;
  EndTime: number;
  BranchName: string;
}

// Export call recordings
export async function exportCallTrafficReportApi(
  payload: IExportCallTrafficPayload,
  token: string
) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };

  try {
    return await downloadFile(
      "v1/exports/reports/call-traffic/dealer",
      payload,
      "call-traffic-report.csv",
      token
    );
  } catch (error) {}
}

export interface ICallTrafficClientReportPayload {
  UserId: string;
  StartIndex: number;
  RecordsPerPage: number;
  SpecificUserId: string;
  SearchText: string;
  StartTime: number;
  EndTime: number;
  BranchName: string;
}

export async function getCallTrafficClientReportApi(
  payload: ICallTrafficReportPayload
) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };

  try {
    const { data } = await apiClient.post(
      `/v1/admin/reports/call-traffic/getUserWiseCallSummary`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export interface ICallTrafficClientReportExportPayload {
  UserId: string;
  SpecificUserId: string;
  SearchText: string;
  StartTime: number;
  EndTime: number;
  BranchName: string;
}

export async function exportCallTrafficClientReportApi(
  payload: ICallTrafficClientReportExportPayload,
  token: string
) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };

  try {
    return await downloadFile(
      `v1/exports/reports/call-traffic/client`,
      payload,
      "ClientCallDetails.csv",
      token
    );
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

/******************** User Activity Report *****************/
export interface IUserActivityReportPayload {
  UserId: string;
  UserCategory: number;
  LoggedInUsers: number;
  StartIndex: number;
  RecordsPerPage: number;
  BranchName: string;
  SearchText: string;
}

export async function getUserActivityReportApi(
  payload: IUserActivityReportPayload
) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };

  try {
    const { data } = await apiClient.post(
      `v1/admin/reports/user-activity/getUserLoggedInDetails`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export interface IUserActivityReportExportPayload {
  UserId: string;
  UserCategory: number;
  LoggedInUsers: number;
  BranchName: string;
  SearchText: string;
}

export async function exportUserLoggedInActivityApi(
  payload: IUserActivityReportExportPayload,
  token: string
) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };

  try {
    return await downloadFile(
      `v1/exports/reports/user-activity/loggedin`,
      payload,
      "UserActivityReport.csv",
      token
    );
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}
