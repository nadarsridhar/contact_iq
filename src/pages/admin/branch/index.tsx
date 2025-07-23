import { useEffect, useState } from "react";

import { DataTable } from "@/components/ui/data-table/data-table";
import { desktopColumns, mobileColumns } from "./columns";
import { Button } from "@/components/ui/button";
import BranchModal from "./BranchModal";
import { useBranchModal } from "@/hooks/useBranchModal";
import { getBranchesApi } from "@/services/apiBranches";
import { ACTIONS } from "@/utils/actions";
import { useAuth } from "@/contexts/AuthContext";
import { VTS_SOCKET_BRANCH_CHANNEL } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import { IGetBranchRequestPayload, ITotalRecords } from "@/utils/interfaces";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { useIsMobile } from "@/hooks";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { RefreshCcw } from "lucide-react";

function BranchMaster() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const { isBranchReadAllowed, isBranchCreateAllowed, isBranchUpdateAllowed, isBranchDeleteAllowed} = usePrivilege();

  const { onOpen: openBranchModal, setData } = useBranchModal();
  const {
    socket,
    isWebSocketConnected,
    agent,
    recordsPerPage,
    setRecordsPerPage,
  } = useAuth();

  const fetchBranches = async (payload: IGetBranchRequestPayload) => {
    try {
      const { Data: data, MetaData: metaData } =
        (await getBranchesApi(payload)) || {};
      setBranches(data);
      setTotalRecords(metaData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBranch = () => {
    openBranchModal();
    setData({ action: ACTIONS.CREATE, modalData: {} });
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
      BranchName: "",
    };

    setIsLoading(true);
    fetchBranches(payload);
  };

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: 0,
      BranchName: "",
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchBranches(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage]);

  // Listen for online branch records socket events
  useEffect(() => {
    if (!isWebSocketConnected) return;
    socket.on(VTS_SOCKET_BRANCH_CHANNEL, async (data) => {
      console.log("Socket branch data received: ", data.message);

      const {
        ActiveFlag,
        BranchAddress,
        BranchCategory,
        BranchId,
        BranchName,
        CreatedDate,
        LastUpdateDate,
        UpdatedBy,
        IsDeleted,
      } = data.message;

      const payload = {
        BranchAddress,
        BranchCategory,
        BranchId,
        BranchName,
        CreatedDate,
        LastUpdateDate,
        UpdatedBy,
        IsDeleted,
      };

      setBranches((prevData) => {
        if (prevData?.length === 0) {
          return [payload];
        }

        const newData = [...prevData];
        const recordToUpdateIndex = newData.findIndex(
          (d) => d?.BranchId === BranchId
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
      socket.off(VTS_SOCKET_BRANCH_CHANNEL);
    };
  }, [socket, isWebSocketConnected]);

  const isMobile = useIsMobile();

  function loadBranches() {
    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      BranchName: "",
    };

    setIsLoading(true);
    setPage(0);
    fetchBranches(payload);
  }

  if (!isBranchReadAllowed) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <div className="flex flex-col py-2.5">
      <div className="flex justify-between items-end mb-2 py-4">
        <h1 className="text-3xl text-primary font-bold md:mx-4 text-center md:text-left">
          Branch
        </h1>
        {isBranchCreateAllowed && (
          <div className="space-x-4">
            <Button onClick={handleAddBranch}>Add</Button>
          </div>
        )}
      </div>

      <div className="rounded-sm mx-1 md:mx-4">
        <div>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Filter branches..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="max-w-sm border border-primary"
              onKeyDown={(e)=>{handleKeyDown(e)}}
              isSearch
            />

            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent"
              onClick={loadBranches}
            >
              <RefreshCcw className="h-5 w-5 text-gray-900" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <DataTable
          tableId="Branch_table"
          columns={isMobile ? mobileColumns : desktopColumns}
          onOpen={openBranchModal}
          setData={setData}
          isUpdateAllowed={isBranchUpdateAllowed}
          isDeleteAllowed={isBranchDeleteAllowed}
          isResetPassordAllowed={false}
          data={branches}
          totalRecords={totalRecords?.TotalRecord ?? 0}
          page={page}
          recordsPerPage={recordsPerPage}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
          setRecordsPerPage={setRecordsPerPage}
        />
      </div>

      <BranchModal />
    </div>
  );
}

export default BranchMaster;
