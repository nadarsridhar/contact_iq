import { useEffect, useState } from "react";

import { DataTable } from "@/components/ui/data-table/data-table";
import { desktopColumns, mobileColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { ACTIONS } from "@/utils/actions";
import { useAuth } from "@/contexts/AuthContext";
import { ITotalRecords } from "@/utils/interfaces";
import { useIsMobile } from "@/hooks";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { getFollowupDetailsApi, IGetFollowup } from "@/services/apiFollowup";
import { useCallTasksModal } from "@/hooks/useCallTasksModal";

function CallTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);

  const isMobile = useIsMobile();
  const { agent, recordsPerPage, setRecordsPerPage } = useAuth();
  const { isFollowupTaskAllowed } = usePrivilege();
  const { onOpen: openCallTasksModal, setData } = useCallTasksModal();

  async function fetchCallTasks(payload: IGetFollowup) {
    try {
      const { Data: data, MetaData: metaData } = await getFollowupDetailsApi(
        payload
      );
      setTasks(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      LoginId: agent.UserId,
      TagId: 0,
      TaskType: 0,
      Status: 0,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      SearchAttendedId: "",
      SearchText: searchText,
    };

    setIsLoading(true);
    fetchCallTasks(payload);
  };

  const handleAddTask = () => {
    openCallTasksModal();
    setData({ action: ACTIONS.CREATE, modalData: {} });
  };

  useEffect(() => {
    const payload = {
      LoginId: agent.UserId,
      TagId: 0,
      TaskType: 0,
      Status: 0,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      SearchAttendedId: "",
      SearchText: searchText,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchCallTasks(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-end mb-2">
        <h1 className="text-3xl text-primary font-bold mx-4 text-center md:text-left">
          Call Tasks
        </h1>
      </div>

      <div className="rounded-sm mx-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="pl-2 grid grid-cols-2 md:grid-cols-6 gap-4 md:justify-between md:items-center">
            <h1>Filters</h1>
            {/* <Filters
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
            /> */}
          </div>

          <div className="mt-4 md:mt-0">
            <div className="flex items-end">
              {/* {isUserExportImportAllowed && !isMobile && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-transparent"
                    onClick={loadUsers}
                  >
                    <RefreshCcw className="h-5 w-5 text-gray-900" />
                    <span className="sr-only">Refresh</span>
                  </Button>

                  <div>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="mt-2 w-[200px]"
                      disabled={isFileUploading}
                      ref={fileInputRef}
                      onClearFile={clearUploadedFile}
                      file={file}
                    />
                  </div>

                  <Button
                    disabled={!Boolean(file) || isFileUploading}
                    className="flex items-center mr-4"
                    variant="outline"
                    onClick={handleFileUpload}
                  >
                    {isFileUploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span className="ml-2">
                      {isFileUploading ? "Importing.." : "Import"}
                    </span>
                  </Button>
                </>
              )} */}

              {isFollowupTaskAllowed && (
                <Button onClick={handleAddTask}>Add</Button>
              )}
            </div>
          </div>
        </div>

        <DataTable
          columns={isMobile ? mobileColumns : desktopColumns}
          data={tasks}
          totalRecords={totalRecords?.TotalRecord || 0}
          page={page}
          recordsPerPage={recordsPerPage}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
          setRecordsPerPage={setRecordsPerPage}
        />
      </div>

      {/* <UsersModal />
      <ResetPasswordModal />

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
      )} */}
    </div>
  );
}

export default CallTasks;
