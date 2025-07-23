import { z } from "zod";
import { userMasterSchema } from "@/schemas/userMaster";
import apiClient from "@/utils/apiClient";
import { getErrorForUser } from "@/utils/errorCodes";
import {
  IDeleteUserRequestPayload,
  IGetUserRequestPayload,
} from "@/utils/interfaces";
import { userPasswordSchema } from "@/schemas/userPassword";
import { userResetPasswordSchema } from "@/schemas/userPasswordReset";
import { isNumber } from "@/lib/utils";

export async function getUserIdsByBranch(payload) {
  try {
    payload = {
      ...payload,
      BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
    };

    const { data } = await apiClient.post(
      `/v1/admin/users/getUsersListByBranch`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getUsersApi(payload: IGetUserRequestPayload) {
  payload = {
    ...payload,
    LoggedInUsers: payload?.LoggedInUsers ?? -1,
    BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
  };
  try {
    const { data } = await apiClient.post(`/v1/admin/users/getUsers`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getLoggedInUsersApi(payload: { LoginId: string }) {
  try {
    const { data } = await apiClient.post(
      `/v1/users/getLoggedInUserInfo`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    throw new Error(error.response.data.error);
  }
}

export async function updateUserApi(payload: z.infer<typeof userMasterSchema>) {
  payload = {
    ...payload,
    CallMode: Number(payload.CallMode),
    LoginMode: Number(payload.LoginMode),
    UserCategory: Number(payload.UserCategory),
    UserStatus: Number(payload.UserStatus),
    WebRTCFlag: Number(payload.WebRTCFlag),
    ActiveFlag: Number(payload.ActiveFlag),
  };

  try {
    const { data } = await apiClient.post(
      `/v1/admin/users/updateUser`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForUser(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);
  }
}

export async function deleteUserApi(payload: IDeleteUserRequestPayload) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/users/deleteUser`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function changeUserPasswordApi(
  payload: z.infer<typeof userPasswordSchema>
) {
  try {
    const { data } = await apiClient.post(`/v1/users/changePassword`, payload);
    return data.data;
  } catch (error: unknown) {
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForUser(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);

    // console.log(error);
    // return Promise.reject(error);
  }
}

export async function resetUserPasswordApi(
  payload: z.infer<typeof userResetPasswordSchema>
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/users/resetPassword`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForUser(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);

    // console.log(error);
    // return Promise.reject(error);
  }
}

export async function validateUserPasswordApi(
  payload: z.infer<typeof userResetPasswordSchema>
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/users/validatePassword`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return Promise.reject(error);
  }
}
