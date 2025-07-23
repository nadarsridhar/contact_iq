import apiClient from "@/utils/apiClient";

export async function updateTemplateMappingApi(payload: any) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/branches/updateTemplateMapping`,
      payload
    );

    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

// Fetch all template ids according to template type - branch or user
export interface IGetMappedTemplateIdsRequest {
  UserId: string;
  StartIndex: number;
  RecordsPerPage: number;
  TemplateType: number;
  MappingTemplateId: string;
}

export interface IGetMappedTemplateIdsResponse {
  Data: string[];
  MetaData: { Result: number };
}

export async function getMappedTemplateIds(
  payload: IGetMappedTemplateIdsRequest
) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/templates/getMappingTemplateIds`,
      payload
    );

    return data.data as Promise<IGetMappedTemplateIdsResponse>;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Fetch all mapped templates
export interface IGetMappedTemplateRequest {
  TemplateType: number;
  TemplateId: string;
}

export interface IGetMappedTemplateResponse {
  Data: { TemplateId: string; TemplateType: number; UserList: string[] };
  MetaData: { Result: number };
}

export async function getMappedTemplate(payload: IGetMappedTemplateRequest) {
  try {
    const { data } = await apiClient.post(
      `/v1/admin/templates/getMappedTemplate`,
      payload
    );

    return data.data as Promise<IGetMappedTemplateResponse>;
  } catch (error) {
    console.log(error);
    return error;
  }
}
