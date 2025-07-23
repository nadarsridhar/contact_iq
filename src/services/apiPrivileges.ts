import { apiClient } from "@/utils";

// Fetch default privilege template data
export interface IGetDefaultPrivilegeTemplateIdsRequest {
  UserCategory: number;
}

export interface IGetDefaultPrivilegeTemplateIdsResponse {
  Data: {
    MenuInfo: object;
    PrivilegeInfo: object;
    Remarks: string;
    TemplateId: string;
    UpdatedBy: string;
    UserCategory: number;
  };
  MetaData: { Result: number };
}

export async function getDefaultPrivilegeTemplateApi(
  payload: IGetDefaultPrivilegeTemplateIdsRequest
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/privileges/getDefaultPrivilegeTemplate`,
      payload
    );

    return data.data as Promise<IGetDefaultPrivilegeTemplateIdsResponse>;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Fetch privilege template ids
export interface IGetPrivilegeTemplateIdsRequest {
  UserId: string;
  StartIndex: number;
  RecordsPerPage: number;
  UserCategory: number;
  TemplateId: string;
}

export interface IGetPrivilegeTemplateIdsResponse {
  Data: object[];
  MetaData: { Result: number };
}

export async function getPrivilegeTemplateIdsApi(
  payload: IGetPrivilegeTemplateIdsRequest
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/privileges/getTemplateIds`,
      payload
    );

    return data.data as Promise<IGetPrivilegeTemplateIdsResponse>;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Fetch privilege template ids
export interface IUpdatePrivilegeTemplateRequest {
  OperationCode: number;
  UserCategory: number;
  IsDeleted: number;
  PrivilegeTempplateId: string;
  MenuInfo: string;
  Remarks: string;
  UpdatedBy: string;
}

export interface IUpdatePrivilegeTemplateResponse {
  Data: object[];
  MetaData: { Result: number };
}

export async function updatePrivilegTemplateApi(
  payload: IUpdatePrivilegeTemplateRequest
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/privileges/updatePrivilegeTemplate`,
      payload
    );

    return data.data as Promise<IUpdatePrivilegeTemplateResponse>;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Fetch privilege template according to privilege template
export interface IGetPrivilegeTemplateRequest {
  UserCategory: string;
  TemplateId: string;
}

export async function getPrivilegeTemplateApi(
  payload: IGetPrivilegeTemplateRequest
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/privileges/getPrivilegeTemplate`,
      payload
    );

    return data.data as Promise<IGetDefaultPrivilegeTemplateIdsResponse>;
  } catch (error) {
    console.log(error);
    return error;
  }
}
