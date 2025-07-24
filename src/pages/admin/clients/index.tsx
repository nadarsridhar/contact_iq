import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/data-table/data-table";
import { desktopColumns, mobileColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { useClientModal } from "@/hooks/useClientModal";
import ClientsModal from "./ClientsModal";
import { ACTIONS } from "@/utils/actions";
import { getClientsApi } from "@/services/apiClients";
import { useAuth } from "@/contexts/AuthContext";
import { VTS_SOCKET_CLIENT_CHANNEL } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import {
  IExportClientRequestPayload,
  IGetBranchRequestPayload,
  IGetClientRequestPayload,
  ITotalRecords,
} from "@/utils/interfaces";
import downloadFile from "@/utils/downloadFile";
import { useIsMobile } from "@/hooks";
import { Download, Loader2, RefreshCcw, Upload, X } from "lucide-react";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import StatusModal from "@/components/StatusModal";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { DataTableColumnHeader } from "@/pages/clients/components/data-table-column-header";
import { validateCSV } from "@/lib/utils";
import Filters from "../dashboard/Filters";
import { getBranchesApi } from "@/services/apiBranches";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import ImportFileModal from "@/components/ui/ImportFileModal";
import AddUsers from "../../../../public/SVGs/AddUsers.svg";

function ClientMaster() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileExporting, setIsFileExporting] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [uploadSuccessText, setUploadSuccessText] = useState("");
  const [uploadFailureText, setUploadFailureText] = useState("");
  const [errorLogFilePath, setErrorLogFilePath] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState("");
  const [searchedBranch, setSearchedBranch] = useState("");

  const [searchText, setSearchText] = useState("");
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const { onOpen: openClientModal, setData } = useClientModal();
  const {
    socket,
    agent,
    isWebSocketConnected,
    token,
    recordsPerPage,
    setRecordsPerPage,
  } = useAuth();
  const {
    isClientReadAllowed,
    isClientCreateAllowed,
    isClientExportImportAllowed,
    isPhoneNumberAllowed,
    isClientUpdateAllowed,
    isClientDeleteAllowed,
    isResetPassordAllowed,
  } = usePrivilege();

  async function fetchClients(payload: IGetClientRequestPayload) {
    try {
      const { Data: data, MetaData: metaData } =
        (await getClientsApi(payload)) || {};
      setClients(data);
      setTotalRecords(metaData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  async function exportClients(payload: IExportClientRequestPayload) {
    try {
      setIsFileExporting(true);
      await downloadFile("v1/exports/clients", payload, "Clients.csv", token);
      toast.success(`Clients file downloaded successfully!`);
      setFileName("");
    } catch (error) {
      toast.error(`Failed to dowload clients file`);
    } finally {
      setIsFileExporting(false);
    }
  }

  const handleAddClient = () => {
    openClientModal();
    setData({ action: ACTIONS.CREATE, modalData: {} });
  };

  const handleFileExport = async () => {
    const payload = {
      SearchText: searchText,
      UserId: agent.UserId,
      BranchName: selectedBranches,
    };
    exportClients(payload);
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile?.name || "");
  };

  const clearUploadedFile = () => {
    setFile(null);
    setFileName("");
    fileInputRef.current.value = "";
  };

  const handleFileUpload = async () => {
    try {
      await validateCSV(file);
      const formData = new FormData();
      formData.append("file", file); // Append the uploaded file
      setIsFileUploading(true);

      const BASE_URL = window.APP_CONFIG.API_URL;
      // Replace this with your API endpoint
      let headersConfig = {
        Authorization: `${token ? `Bearer ${token}` : ""}`,
      };
      if (!token) delete headersConfig["Authorization"];
      fetch(`${BASE_URL}/v1/uploads/clients`, {
        method: "POST",
        headers: headersConfig,
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          const successCount = result.data.MetaData.SuccessCount;
          const failureCount = result.data.MetaData.FailureCount;
          loadClients();
          setStatusModal(true);
          setUploadSuccessText(
            `${successCount} client(s) uploaded successfully.`
          );
          setUploadFailureText(
            failureCount > 0 ? `${failureCount} client(s) upload failed.` : ""
          );
          setErrorLogFilePath(result.data.MetaData.FileName);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          toast.error("Clients upload failed!");
        })
        .finally(() => {
          setIsFileUploading(false);
          clearUploadedFile();
        });
    } catch (error) {
      console.error("Error", error);
      toast.error(error?.message);
    } finally {
      setIsFileUploading(false);
    }
  };

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: nextPageNumber * recordsPerPage,
      BranchName: selectedBranches,
    };

    setIsLoading(true);
    fetchClients(payload);
  };

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: 0,
      BranchName: selectedBranches,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchClients(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage, selectedBranches]);

  // Listen for online client records socket events
  useEffect(() => {
    if (!isWebSocketConnected) return;
    socket.on(VTS_SOCKET_CLIENT_CHANNEL, async (data) => {
      console.log("Socket user data received: ", data.message);

      // if (data.code === VTS_SOCKET_CLIENT_CODE) {
      const {
        ClientId,
        ClientName,
        ClientNumber,
        ClientAlternateNumber,
        ClientEmailId,
        ActiveFlag,
        Tpin,
        BranchId,
        PreferedAgentId1,
        PreferedAgentId2,
        PreferedAgentId3,
        MappingTemplateId,
        CreatedDate,
        LastUpdateDate,
        UpdatedBy,
        IsDeleted,
        BranchName,
      } = data.message;

      const payload = {
        ClientId,
        ClientName,
        ClientNumber,
        ClientAlternateNumber,
        ClientEmailId,
        ActiveFlag,
        Tpin,
        BranchId,
        PreferedAgentId1,
        PreferedAgentId2,
        PreferedAgentId3,
        MappingTemplateId,
        CreatedDate,
        LastUpdateDate,
        UpdatedBy,
        IsDeleted,
        BranchName,
      };

      setClients((prevData) => {
        if (prevData?.length === 0) {
          return [payload];
        }

        const newData = [...prevData];
        const recordToUpdateIndex = newData.findIndex(
          (d) => d?.ClientId === ClientId
        );

        if (recordToUpdateIndex != -1) {
          newData[recordToUpdateIndex] = { ...payload };
        } else {
          newData.unshift(payload);
        }
        return newData;
      });
    });

    return () => {
      socket.off(VTS_SOCKET_CLIENT_CHANNEL);
    };
  }, [socket, isWebSocketConnected]);

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: 5,
      SearchText: "",
      StartIndex: 0,
      BranchName: searchedBranch,
    };

    const handler = setTimeout(() => {
      if ((searchedBranch && searchedBranch.length > 2) || !searchedBranch) {
        fetchBranchList(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchedBranch]);

  const isMobile = useIsMobile();

  function loadClients() {
    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      BranchName: selectedBranches,
    };

    setIsLoading(true);
    fetchClients(payload);
  }

  if (!isClientReadAllowed) return null;

  const columns = useMemo(() => {
    const cols = [...desktopColumns];
    if (isPhoneNumberAllowed) {
      const obj = {
        accessorKey: "ClientNumber",
        header: ({ column }) => (
          <DataTableColumnHeader className="flex justify-start items-center" column={column} title="Mobile Number" />
        ),
        enableResizing: true,
        size: 90,
        minSize: 30,
        maxSize: 300,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2 justify-start items-center p-2">
              <span className="max-w-[500px]  truncate">
                {row.getValue("ClientNumber")}
              </span>
            </div>
          );
        },
      };
      cols.splice(4, 0, obj);
    }

    if (isClientCreateAllowed) {
      const tPinColumn = {
        accessorKey: "Tpin",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tpin" />
        ),
        enableResizing: true,
        size: 50,
        minSize: 30,
        maxSize: 300,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2 p-2">
              <span className="max-w-[500px] truncate">
                {row.getValue("Tpin")}
              </span>
            </div>
          );
        },
      };

      const clientEmailId = {
        accessorKey: "ClientEmailId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        enableResizing: true,
        size: 60,
        minSize: 30,
        maxSize: 300,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2 p-2">
              <span className="max-w-[500px] truncate">
                {row.getValue("ClientEmailId")}
              </span>
            </div>
          );
        },
      };

      const updatedByColumn = {
        accessorKey: "UpdatedBy",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated By" />
        ),
        enableResizing: true,
        size: 100,
        minSize: 30,
        maxSize: 300,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2 p-2">
              <span className="max-w-[500px] truncate">
                {row.getValue("UpdatedBy")}
              </span>
            </div>
          );
        },
      };

      const lastUpdateTimeColumn = {
        accessorKey: "LastUpdateTime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Updated Time" />
        ),
        enableResizing: true,
        size: 130,
        minSize: 30,
        maxSize: 300,
        cell: ({ row }) => {
          const formattedTime = format(
            new Date(Number(row.original.LastUpdateDate) * 1000),
            "PPpp"
          );

          return (
            <div className="flex space-x-2 p-2">
              <span className="max-w-[500px] truncate">{formattedTime}</span>
            </div>
          );
        },
      };

      const templateColumn = {
        accessorKey: "MappingTemplateId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mapped Template" />
        ),
        enableResizing: true,
        size: 100,
        minSize: 30,
        maxSize: 300,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2 p-2">
              <span className="max-w-[500px] truncate">
                {row.getValue("MappingTemplateId")}
              </span>
            </div>
          );
        },
      };

      cols.splice(9, 0, templateColumn);
      cols.splice(11, 0, tPinColumn);
      cols.splice(12, 0, clientEmailId);
      cols.splice(13, 0, updatedByColumn);
      cols.splice(14, 0, lastUpdateTimeColumn);
    }

    return cols;
  }, [clients]);

  async function fetchBranchList(payload: IGetBranchRequestPayload) {
    const { Data: data, MetaData: metaData } = await getBranchesApi(payload);
    setBranches(data);
  }

  const comboboxBranches = [{ label: "All", value: "All" }];
  branches?.forEach((branch) => {
    comboboxBranches.push({
      label: branch.BranchName,
      value: branch.BranchName,
    });
  });

  const { pathname } = useLocation();

  function handleClearFilters() {
    setSearchText("");
    setSelectedBranches("All");
  }

  const showClearFilterButton =
    searchText !== "" || (selectedBranches && selectedBranches !== "All");

  const [importModalOpen, setImportModalOpen] = useState(false);

  return (
    <div className="flex flex-col py-2.5">
      <div
        className={`flex justify-between items-end mb-2 py-4 ${
          pathname.includes("dashboard") && "hidden"
        } `}
      >
        <h1
          className={`text-3xl text-primary font-bold md:mx-4 text-center md:text-left`}
        >
          Clients
        </h1>
      </div>

      <div className="rounded-sm mx-1 md:mx-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:justify-between md:items-center">
            <Filters
              searchText={searchText}
              setSearchText={setSearchText}
              showTags={false}
              comboboxBranches={comboboxBranches}
              selectedBranches={selectedBranches}
              setSelectedBranches={setSelectedBranches}
              setBranchSearchText={setSearchedBranch}
            />
            <div className="">
              {/* Clear Filter Button */}
              {showClearFilterButton && (
                <Badge
                  variant="outline"
                  className="border-[#f97316] cursor-pointer py-2 group hover:bg-[#f97316] hover:text-white text-[#f97316]"
                  onClick={handleClearFilters}
                >
                  <span className="whitespace-nowrap">clear filters</span>
                  <div className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-3 w-3 text-[#f97316] group-hover:text-white" />
                  </div>
                </Badge>
              )}
            </div>
          </div>

          <div className="sm:mt-2 md:mt-0">
            <div className="flex flex-row gap-2 items-center justify-end">
              {isClientExportImportAllowed && !isMobile && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-transparent px-0 lg:px-1"
                    onClick={loadClients}
                  >
                    <RefreshCcw className="h-5 w-5 text-gray-900" />
                    <span className="sr-only">Refresh</span>
                  </Button>

                  <Button
                    className="w-full sm:w-auto flex items-center justify-center"
                    variant="outline"
                    onClick={() => {
                      setImportModalOpen(true);
                    }}
                  >
                    <Upload size={14} />
                    <span className="ml-2 hidden lg:block">
                      {isFileUploading ? "Importing.." : "Import"}
                    </span>
                  </Button>
                </>
              )}

              {isClientExportImportAllowed && !isMobile && (
                <Button
                  className="w-full sm:w-auto flex items-center justify-center"
                  variant="outline"
                  onClick={handleFileExport}
                  disabled={isFileExporting}
                >
                  {isFileExporting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span className="ml-2 hidden  lg:block">
                    {isFileExporting ? "Exporting.." : "Export"}
                  </span>
                </Button>
              )}

              <div className="flex items-center w-full justify-end">
                {isClientCreateAllowed && (
                  <Button
                    className="w-12 lg:w-16 p-0"
                    onClick={handleAddClient}
                  >
                    <img
                      src={AddUsers}
                      alt="Add Users"
                      className=" lg:hidden w-[20px] h-[20px]"
                    />
                    <span className="hidden lg:block">Add</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DataTable
          tableId="clients_table"
          columns={isMobile ? mobileColumns : columns}
          onOpen={openClientModal}
          setData={setData}
          isUpdateAllowed={isClientUpdateAllowed}
          isDeleteAllowed={isClientDeleteAllowed}
          data={clients ?? []}
          totalRecords={totalRecords?.TotalRecord || 0}
          page={page}
          recordsPerPage={recordsPerPage}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
          setRecordsPerPage={setRecordsPerPage}
        />
      </div>

      <ClientsModal />

      {importModalOpen && (
        <ImportFileModal
          handleFileChange={handleFileChange}
          isFileUploading={isFileUploading}
          handleFileUpload={handleFileUpload}
          file={file}
          clearUploadedFile={clearUploadedFile}
          fileInputRef={fileInputRef}
          setImportModalOpen={setImportModalOpen}
        />
      )}

      <StatusModal
        successTitle={uploadSuccessText}
        failureTitle={uploadFailureText}
        title="Client upload status"
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        fileName={errorLogFilePath}
        exportedFileName="ClientErrorLogs"
      />
    </div>
  );
}

export default ClientMaster;
