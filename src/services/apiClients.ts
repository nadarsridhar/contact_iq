import { isNumber } from "@/lib/utils";
import { clientMasterSchema } from "@/schemas/clients";
import apiClient from "@/utils/apiClient";
import { getErrorForClient } from "@/utils/errorCodes";
import {
  IDeleteClientRequestPayload,
  IExportClientRequestPayload,
  IGetClientRequestPayload,
} from "@/utils/interfaces";
import { z } from "zod";

export async function getClientIdsApi(payload = {}) {
  try {
    payload = {
      ...payload,
      BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
    };
    const { data } = await apiClient.post(`/v1/admin/getClientIds`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getClientsApi(payload: IGetClientRequestPayload) {
  try {
    payload = {
      ...payload,
      BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
    };
    const { data } = await apiClient.post(
      `/v1/admin/clients/getClients`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function updateClientApi(
  payload: z.infer<typeof clientMasterSchema>
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/clients/updateClient`,
      payload
    );

    return data;
  } catch (error: unknown) {
    console.error(error);
    const errorResponse = error?.response?.data?.message;
    const errorMsg = isNumber(errorResponse)
      ? getErrorForClient(Number(errorResponse))
      : errorResponse;
    return Promise.reject(errorMsg);
  }
}

export async function deleteClientApi(payload: IDeleteClientRequestPayload) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/clients/deleteClient`,
      payload
    );
    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getClientsByMobileNumber(payload: {
  ClientNumber: string;
}) {
  try {
    const { data } = await apiClient.post(
      `/v1/calls/getClientsByMobileNumber`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function exportClientApi(payload: IExportClientRequestPayload) {
  try {
    const { data } = await apiClient.post(`/v1/exports/clients`, payload);
    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function getRecordingsApi(formData) {
  try {
    const { data } = await apiClient.post(`/v1/uploads/clients`, formData);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}
