import apiClient from "@/utils/apiClient";

export async function getClientsApi(payload) {
  try {
    const { data } = await apiClient.post(`/v1/calls/getClients`, payload);
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}
