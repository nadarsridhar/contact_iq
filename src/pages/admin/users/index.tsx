import { useEffect, useRef, useState } from "react";

import { DataTable } from "@/components/ui/data-table/data-table";
import { desktopColumns, mobileColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import { getUsersApi } from "@/services/apiUser";
import UsersModal from "./UsersModal";
import { ACTIONS } from "@/utils/actions";
import { useAuth } from "@/contexts/AuthContext";
import { VTS_SOCKET_USER_CHANNEL } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import {
  IExportUserRequestPayload,
  IGetBranchRequestPayload,
  IGetUserRequestPayload,
  ITagFilter,
  ITotalRecords,
} from "@/utils/interfaces";
import { toast } from "sonner";
import downloadFile from "@/utils/downloadFile";
import { useIsMobile } from "@/hooks";
import { Download, Loader2, RefreshCcw, Upload, X } from "lucide-react";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import ResetPasswordModal from "@/components/ResetPassword";
import { useValidatePassword } from "@/hooks/useValidatePassword";
import StatusModal from "@/components/StatusModal";
import globalState from "@/utils/globalState";
import { usePrivilege } from "@/contexts/PrivilegeContext";

import { validateCSV } from "@/lib/utils";
import Filters from "../dashboard/Filters";
import { getBranchesApi } from "@/services/apiBranches";
import { Badge } from "@/components/ui/badge";
import AddUsers from "../../../../public/SVGs/AddUsers.svg";
import ImportFileModal from "@/components/ui/ImportFileModal";

function UserMaster() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileExporting, setIsFileExporting] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [uploadSuccessText, setUploadSuccessText] = useState("");
  const [uploadFailureText, setUploadFailureText] = useState("");
  const [errorLogFilePath, setErrorLogFilePath] = useState("");

  const [searchText, setSearchText] = useState("");
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const [loggedInFilter, setLoggedInFilter] = useState(-1);
  const [selectedUserCategory, setSelectedUserCategory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState("");
  const [searchedBranch, setSearchedBranch] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { onOpen: openUserModal, setData } = useUserMasterModal();
  const { onOpen: openValidatePasswordModal } = useValidatePassword();
  const {
    socket,
    isWebSocketConnected,
    token,
    agent,
    recordsPerPage,
    setRecordsPerPage,
  } = useAuth();
  const {
    isUserReadAllowed,
    isUserCreateAllowed,
    isUserExportImportAllowed,
    isChangePassordAllowed,
    isUserUpdateAllowed,
    isUserDeleteAllowed,
    isResetPassordAllowed,
  } = usePrivilege();

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile?.name || "");
  };

  async function fetchUsers(payload: IGetUserRequestPayload) {
    try {
      const { Data: data, MetaData: metaData } =
        (await getUsersApi(payload)) || 0;
      setUsers(data);
      setTotalRecords(metaData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  async function exportUsers(payload: IExportUserRequestPayload) {
    try {
      setIsFileExporting(true);
      await downloadFile(
        "v1/exports/users",
        payload,
        `${globalState.AGENT_NAME}.csv`,
        token
      );
      toast.success(`${globalState.AGENT_NAME} file downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to download users file`);
    } finally {
      setIsFileExporting(false);
    }
  }

  const handleAddUser = () => {
    openUserModal();
    setData({ action: ACTIONS.CREATE, modalData: {} });
  };

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);
    const userCategoryId =
      selectedUserCategory.length > 0
        ? selectedUserCategory.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const payload = {
      LoginId: agent.UserId,
      UserCategory: userCategoryId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: nextPageNumber * recordsPerPage,
      UserId: "",
      BranchName: selectedBranches,
      LoggedInUsers: loggedInFilter,
    };

    setIsLoading(true);
    fetchUsers(payload);
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
      let headersConfig = {
        Authorization: `${token ? `Bearer ${token}` : ""}`,
      };
      if (!token) delete headersConfig["Authorization"];
      // Replace this with your API endpoint
      fetch(`${BASE_URL}/v1/uploads/users`, {
        method: "POST",
        headers: headersConfig,
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          const successCount = result.data.MetaData.SuccessCount;
          const failureCount = result.data.MetaData.FailureCount;
          loadUsers();
          setStatusModal(true);
          setUploadSuccessText(
            `${successCount} user(s) uploaded successfully.`
          );
          setUploadFailureText(
            failureCount > 0 ? `${failureCount} user(s) upload failed.` : ""
          );
          setErrorLogFilePath(result.data.MetaData.FileName);
        })
        .catch((error) => {
          toast.error(error.message);
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

  useEffect(() => {
    const userCategoryId =
      selectedUserCategory.length > 0
        ? selectedUserCategory.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const payload = {
      LoginId: agent.UserId,
      UserCategory: userCategoryId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: 0,
      UserId: "",
      BranchName: selectedBranches,
      LoggedInUsers: loggedInFilter,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchUsers(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [
    searchText,
    recordsPerPage,
    loggedInFilter,
    selectedUserCategory,
    selectedBranches,
  ]);

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

  // Listen for online user records socket events
  useEffect(() => {
    if (!isWebSocketConnected) return;
    socket.on(VTS_SOCKET_USER_CHANNEL, async (data) => {
      console.log("Socket user data received: ", data.message);

      // if (data.code === VTS_SOCKET_USER_CODE) {
      const {
        UserId,
        UserName,
        Password,
        UserCategory,
        UserMobileNumber,
        UserAlternateMobileNumber,
        CompanyName,
        Pin,
        UserEmailId,
        ActiveFlag,
        CallMode,
        UserStatus,
        BranchId,
        BranchName,
        LoginMode,
        MappingTemplateId,
        PrivilegeTemplateId,
        WorkingHoursTemplateId,
        UpdatedBy,
        IsDeleted,
        LastUpdateDate,
        WebRTCFlag,
        LoggedIn,
      } = data.message;

      const payload = {
        UserId,
        UserName,
        Password,
        UserCategory,
        UserMobileNumber,
        CompanyName,
        Pin,
        UserEmailId,
        ActiveFlag,
        CallMode,
        UserStatus,
        WebRTCFlag,
        BranchId,
        LoginMode,
        MappingTemplateId,
        PrivilegeTemplateId,
        WorkingHoursTemplateId,
        BranchName,
        UpdatedBy,
        IsDeleted,
        UserAlternateMobileNumber,
        LoggedIn,
        LastUpdateDate,
      };

      setUsers((prevData) => {
        if (prevData?.length === 0) {
          return [payload];
        }

        const newData = [...prevData];
        const recordToUpdateIndex = newData.findIndex(
          (d) => d?.UserId === UserId
        );

        if (recordToUpdateIndex != -1) {
          newData[recordToUpdateIndex] = { ...payload };
        } else {
          newData.unshift(payload);
        }
        return newData;
      });
      // }
    });

    return () => {
      socket.off(VTS_SOCKET_USER_CHANNEL);
    };
  }, [isWebSocketConnected, socket]);

  const handleFileExport = async () => {
    const userCategoryId =
      selectedUserCategory.length > 0
        ? selectedUserCategory.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const payload = {
      LoginId: agent.UserId,
      UserCategory: userCategoryId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: 0,
      UserId: "",
      BranchName: selectedBranches,
      LoggedInUsers: loggedInFilter,
    };
    exportUsers(payload);
  };

  const isMobile = useIsMobile();

  function loadUsers() {
    const userCategoryId =
      selectedUserCategory.length > 0
        ? selectedUserCategory.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const payload = {
      LoginId: agent.UserId,
      UserCategory: userCategoryId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      UserId: "",
      BranchName: selectedBranches,
      LoggedInUsers: loggedInFilter,
    };

    setIsLoading(true);
    fetchUsers(payload);
  }

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

  if (!isUserReadAllowed) return null;

  function handleClearFilters() {
    setSearchText("");
    setSelectedBranches("All");
    setSelectedUserCategory([]);
    setLoggedInFilter(-1);
  }

  const showClearFilterButton =
    searchText !== "" ||
    (selectedBranches && selectedBranches !== "All") ||
    selectedUserCategory.length > 0 ||
    loggedInFilter !== -1;


  return (
    <div className="flex flex-col py-2.5">
      <div className="flex justify-between items-end mb-2 py-4">
        <h1 className="text-3xl text-primary font-bold md:mx-4 text-center md:text-left">
          Users
        </h1>
      </div>

      <div className="rounded-sm mx-1 md:mx-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="grid grid-cols-2 sm:flex gap-2 md:justify-between md:items-center ">
            <Filters
              searchText={searchText}
              setSearchText={setSearchText}
              showTags={false}
              setSelectedUserCategory={setSelectedUserCategory}
              selectedUserCategory={selectedUserCategory}
              loggedInFilter={loggedInFilter}
              setLoggedInFilter={setLoggedInFilter}
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
              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent px-0 lg:px-1"
                onClick={loadUsers}
              >
                <RefreshCcw className="h-5 w-5 text-gray-900" />
                <span className="sr-only">Refresh</span>
              </Button>
              {isUserExportImportAllowed && !isMobile && (
                <Button
                  className="w-full sm:w-auto flex items-center justify-center"
                  variant="outline"
                  onClick={() => {
                    setImportModalOpen(true);
                  }}
                >
                  <Upload size={14} />
                  <span className="ml-2 hidden  lg:block">
                    {isFileUploading ? "Importing.." : "Import"}
                  </span>
                </Button>
              )}

              {/* Export Button */}
              {isUserExportImportAllowed && !isMobile && (
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
                  <span className="ml-2 hidden lg:block">
                    {isFileExporting ? "Exporting.." : "Export"}
                  </span>
                </Button>
              )}

              {/* Change Password Button */}
              {isChangePassordAllowed && (
                <Button
                  variant="outline"
                  className="w-auto"
                  onClick={openValidatePasswordModal}
                >
                  Change Password
                </Button>
              )}

              {/* Addpage User Button */}
              {isUserCreateAllowed && (
                <div className="w-auto">
                  <Button className="w-12 lg:w-16 p-0" onClick={handleAddUser}>
                    <img
                      src={AddUsers}
                      alt="Add Users"
                      className=" lg:hidden w-[20px] h-[20px]"
                    />
                    <span className="hidden lg:block">Add</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DataTable
          tableId="users_table"
          columns={isMobile ? mobileColumns : desktopColumns}
          onOpen={openUserModal}
          setData={setData}
          isUpdateAllowed={isUserUpdateAllowed}
          isDeleteAllowed={isUserDeleteAllowed}
          isResetPassordAllowed={isResetPassordAllowed}
          data={users ?? []}
          totalRecords={totalRecords?.TotalRecord || 0}
          page={page}
          recordsPerPage={recordsPerPage}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
          setRecordsPerPage={setRecordsPerPage}
        />
      </div>

      <UsersModal />
      <ResetPasswordModal />
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

      {isUserExportImportAllowed && (
        <StatusModal
          successTitle={uploadSuccessText}
          failureTitle={uploadFailureText}
          title={`${globalState.AGENT_NAME} upload status`}
          isOpen={statusModal}
          onClose={() => setStatusModal(false)}
          fileName={errorLogFilePath}
          exportedFileName="UserErrorLogs"
        />
      )}
    </div>
  );
}

export default UserMaster;
