import apiClient from "@/utils/apiClient";

interface IPayload {
  userId: string;
  password: string;
}

export async function loginApi(payload: IPayload) {
  try {
    let { data } = await apiClient.post(`/v1/auth/login`, payload);
    if (window.APP_CONFIG.E_MODE) data = JSON.parse(data);
    return data;
  } catch (error) {
    console.error(error.response.data.error ?? error.response.data.message);
    if (window.APP_CONFIG.E_MODE)
      error.response.data = JSON.parse(error.response.data);
    throw new Error(error.response.data?.error ?? error.response.data?.message);
  }
}

export async function logoutApi(payload: { UserId: string }) {
  try {
    await apiClient.post("/v1/auth/logout", payload);
  } catch (error) {
    console.error(error.response.data.error ?? error.response.data.message);
    throw new Error(error.response.data?.error ?? error.response.data?.message);
  }
}

export async function samlLogoutApi() {
  try {
    await apiClient.get("/v1/auth/saml/logout");
  } catch (error) {
    console.error(error.response.data.error ?? error.response.data.message);
    throw new Error(error.response.data?.error ?? error.response.data?.message);
  }
}

export async function localStorageApi() {
  try {
    const { data } = await apiClient.post(`/v1/auth/getLocalStorageSecretKey`);
    return data.lssk;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export async function validateSessionApi() {
  try {
    const { data } = await apiClient.get(`/v1/auth/validateSession`);
    return data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

/********************** Generate API key *********************/
export async function generateKeyApi() {
  try {
    const { data } = await apiClient.post("/v1/auth/generateApiKey");
    return data.data;
  } catch (error) {
    console.error(error.response.data.error ?? error.response.data.message);
    throw new Error(error.response.data?.error ?? error.response.data?.message);
  }
}

export async function getKeyApi() {
  try {
    const { data } = await apiClient.post("/v1/auth/getApiKey");
    return data.data;
  } catch (error) {
    console.error(error.response.data.error ?? error.response.data.message);
    throw new Error(error.response.data?.error ?? error.response.data?.message);
  }
}
