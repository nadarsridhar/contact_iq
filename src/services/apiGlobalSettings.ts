import { isNumber } from "@/lib/utils";
import apiClient from "@/utils/apiClient";
import { getErrorForCallLogs } from "@/utils/errorCodes";

export async function getGlobalSettingsApi(payload: { UserId: string }) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/getGlobalSettings`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function updateGlobalSettingsApi(payload: {
  UserId: string;
  SettingsValue: string;
}) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/updateGlobalSettings`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    // const errorMsg = isNumber(errorResponse)
    //   ? getErrorForCallLogs(Number(errorResponse))
    //   : errorResponse;
    return Promise.reject(errorResponse);
  }
}

export async function updateDefaultPasswordApi(payload: {
  UserId: string;
  DefaultPassword: string;
}) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/updateDefaultPassword`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    // const errorMsg = isNumber(errorResponse)
    //   ? getErrorForCallLogs(Number(errorResponse))
    //   : errorResponse;
    return Promise.reject(errorResponse);
  }
}
