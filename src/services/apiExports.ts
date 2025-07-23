import downloadFile from "@/utils/downloadFile";

// Export call recordings
export async function exportErrorLogFileApi(
  token: string,
  payload: { fileName: string },
  exportedFileName
) {
  try {
    return await downloadFile(
      "v1/recordings/exportErrorLogs",
      payload,
      exportedFileName,
      token
    );
  } catch (error) {}
}
