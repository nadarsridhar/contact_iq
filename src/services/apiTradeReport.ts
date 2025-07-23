import { apiClient } from "@/utils";
import downloadFile from "@/utils/downloadFile";

export interface IGetTradeExceptionReportByOrderPayload {
  UserId: string;
  StartIndex: number;
  RecordsPerPage: number;
  ReportType: number;
  StartTime: number;
  SearchText: string;
}

export async function fetchTradeExceptionReporByOrderApi(
  payload: IGetTradeExceptionReportByOrderPayload
) {
  try {
    const { data } = await apiClient.post(
      `/v1/reports/trade-exception/fetchTradeExceptionByOrder`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

export interface IGetTradeExceptionReportByTradePayload {
  UserId: string;
  StartIndex: number;
  RecordsPerPage: number;
  ReportType: number;
  StartTime: number;
  OrderNumber: string;
  SearchText: string;
}

export async function fetchTradeExceptionReportByTradeApi(
  payload: IGetTradeExceptionReportByTradePayload
) {
  try {
    const { data } = await apiClient.post(
      `/v1/reports/trade-exception/fetchTradeExceptionByTrade`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

interface IGenerateTradeReportPayload {
  StartTime: number;
  Regenerate: number;
}

export async function generateTradeReportApi(
  payload: IGenerateTradeReportPayload
) {
  try {
    const { data } = await apiClient.post(
      `/v1/reports/trade-exception/generateTradeException`,
      payload
    );
    return data.data;
  } catch (error: unknown) {
    console.log(error);
    return error;
  }
}

// Export trade exception report
interface IExportTradeExceptionReport {
  UserId: string;
  ReportType: number;
  Date: number;
  SearchText: string;
}

export async function exportTradeExceptionReportApi(
  payload: IExportTradeExceptionReport,
  token: string,
  fileName: string
) {
  try {
    return await downloadFile(
      `v1/reports/exports/trade-exception`,
      payload,
      fileName,
      token
    );
  } catch (error) {}
}
