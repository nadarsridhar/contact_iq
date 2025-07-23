const downloadFile = async (
  apiName: string,
  payload: any,
  FileName: string,
  token: string
) => {
  // Fetch the audio file using axios
  try {
    const BASE_URL = window.APP_CONFIG.API_URL;
    let headersConfig = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${token ? `Bearer ${token}` : ""}`,
    };
    if (!token) delete headersConfig["Authorization"];

    const response = await fetch(`${BASE_URL}/${apiName}`, {
      method: "POST",
      headers: headersConfig,
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = FileName; // Default filename
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up the link element
    window.URL.revokeObjectURL(url); //
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Error(`Error fetching file`);
  }
};

export default downloadFile;
