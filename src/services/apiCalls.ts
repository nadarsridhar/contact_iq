import { isNumber } from "@/lib/utils";
import apiClient from "@/utils/apiClient";
import { getErrorForCallLogs } from "@/utils/errorCodes";

interface IAddUpdateDailyCallLog {
  Feedback: number;
  TagId: number;
  UniqueCallIdentifier: string;
  ClientId: string;
  UserId: string;
  Remarks: string;
  UpdatedBy: string;
}

export async function getCallsApi(payload) {
  try {
    payload = {
      ...payload,
      BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
    };
    const { data } = await apiClient.post(`/v1/calls/getCalls`, payload);
    // data.sort((a, b) => b.timestamp - a.timestamp);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getRecordingApi(RecordingName) {
  try {
    const { data } = await apiClient.post(`/v1/recordings/getRecording`, {
      RecordingName,
    });
    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getAdminCallStats(payload: {
  UserId: string;
  CallType: number;
  BranchName: string;
  UserIds: string;
  CallStatus: number;
  SearchText: string;
  StartTime: number;
  EndTime: number;
  TagId: number;
}) {
  payload = {
    ...payload,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };
  try {
    const { data } = await apiClient.post(
      `/v1/admin/calls/getAdminCallStats`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function updateClientRecordsApi(payload: IAddUpdateDailyCallLog) {
  try {
    const { data } = await apiClient.post(
      `/v1/calls/updateCallDetails`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForCallLogs(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);
  }
}

interface IAMIPayload {
  AgentNumber: string;
  AgentId: string;
  ClientName: string;
  ClientId: string;
  ClientNumber: string;
}

export async function makeCallApi(payload: IAMIPayload) {
  try {
    const { data } = await apiClient.post(`/v1/calls/makeCall`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

interface ICallTransferPayload extends IAMIPayload {
  TargetAgentNumber: string;
  AgentChannel: string;
  UniqueCallIdentifier: string;
}

export async function transferCallApi(payload: ICallTransferPayload) {
  try {
    const { data } = await apiClient.post(`/v1/calls/transferCall`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

interface IHangupPayload {
  AgentChannel: string;
}

export async function hangupCallApi(payload: IHangupPayload) {
  try {
    const { data } = await apiClient.post(`/v1/calls/hangupCall`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

interface IMuteAudioPayload {
  AgentChannel: string;
  muteState: boolean;
}

export async function muteAudioApi(payload: IMuteAudioPayload) {
  try {
    const { data } = await apiClient.post(`/v1/calls/muteaudio`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}
