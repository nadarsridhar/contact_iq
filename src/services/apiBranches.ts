import { z } from "zod";
import { branchSchema } from "@/schemas/branch";
import apiClient from "@/utils/apiClient";
import { getErrorForBranch } from "@/utils/errorCodes";
import {
  IDeleteBranchRequestPayload,
  IGetBranchRequestPayload,
} from "@/utils/interfaces";
import { isNumber } from "@/lib/utils";

export async function getBranchesApi(payload: IGetBranchRequestPayload) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/branches/getBranches`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function updateBranchApi(payload: z.infer<typeof branchSchema>) {
  payload = {
    ...payload,
    BranchCategory: Number(payload.BranchCategory),
  };

  try {
    const { data } = await apiClient.post(
      `/v1/admin/branches/updateBranch`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForBranch(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);
  }
}

export async function deleteBranchApi(payload: IDeleteBranchRequestPayload) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/branches/deleteBranch`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}
