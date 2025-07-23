import { z } from "zod";

import { isNumber } from "@/lib/utils";
import { followupTaskSchema } from "@/schemas/followup";
import { apiClient } from "@/utils";
import { getErrorForFollowUp } from "@/utils/errorCodes";

export interface IGetFollowups {
  LoginId: string;
  TagId: number;
  TaskType: number;
  Status: number;
  AutoCalls: number;
  StartIndex: number;
  RecordsPerPage: number;
  SearchAttendedId: string;
  SearchText: string;
}

export async function getFollowupsApi(payload: IGetFollowups) {
  try {
    const { data } = await apiClient.post(`/v1/followup/getFollowups`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export interface IGetFollowupDetails {
  UUID: string;
  LoginId: string;
}

export async function getFollowupDetailsApi(payload: IGetFollowupDetails) {
  try {
    const { data } = await apiClient.post(
      `/v1/followup/getFollowUpInfo`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function updateFollowupApi(
  payload: z.infer<typeof followupTaskSchema>
) {
  try {
    const { data } = await apiClient.post(
      `/v1/followup/updateFollowup`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForFollowUp(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);
  }
}
