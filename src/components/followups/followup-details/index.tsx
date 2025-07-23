import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { DataTable } from "@/pages/recent-calls/components/data-table";
import { ITotalRecords } from "@/utils/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_ACTION_TYPE } from "@/pages/recent-calls/components/data-table-pagination";
import { desktopColumns, mobileColumns } from "./columns";
import { useIsMobile } from "@/hooks";
import {
  getFollowupDetailsApi,
  IGetFollowupDetails,
} from "@/services/apiFollowup";
import {
  useCreateFollowup,
  useFollowupDetails,
} from "@/hooks/useCreateFollowup";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { ACTIONS } from "@/utils/actions";
import { TaskStatus } from "@/utils/followup";

function FollowupDetails() {
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [followupDetails, setFollowupDetails] = useState([]);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const { isOpen, onClose, data: followupModalDetails } = useFollowupDetails();
  const { recordsPerPage, setRecordsPerPage, agent } = useAuth();
  const { isFollowupTaskAllowed } = usePrivilege();
  const {
    onOpen: openCreateFollowupDialog,
    setData: setModifyFollowupTask,
    triggerApiRefresh,
  } = useCreateFollowup();
  const isMobile = useIsMobile();

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      UUID: followupModalDetails.UniqueCallIdentifier,
      LoginId: agent.UserId,
    };
    setIsLoading(true);
    fetchFollowupDetails(payload);
  };

  // Fetch call records
  async function fetchFollowupDetails(payload: IGetFollowupDetails) {
    try {
      const { Data, MetaData: totalRecordsData } =
        (await getFollowupDetailsApi(payload)) || {};
      setFollowupDetails(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching follow up details`, error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!followupModalDetails?.UniqueCallIdentifier) return;

    const payload = {
      UUID: followupModalDetails.UniqueCallIdentifier,
      LoginId: agent.UserId,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchFollowupDetails(payload);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchText,
    recordsPerPage,
    followupModalDetails?.UniqueCallIdentifier,
    agent?.UserId,
    triggerApiRefresh,
  ]);

  const contextMenuItems = [
    {
      label: "Modify followup",
      onClick: (row) => {
        // Open create followup dialog
        openCreateFollowupDialog();
        setModifyFollowupTask({
          ...row.original,
          OperationCode: ACTIONS.UPDATE,
          Status: TaskStatus.Todo,
        });
      },
      isPrivilage: () => isFollowupTaskAllowed,
    },
    {
      label: "Cancel followup",
      onClick: (row) => {
        openCreateFollowupDialog();
        setModifyFollowupTask({
          ...row.original,
          OperationCode: ACTIONS.UPDATE,
          Status: TaskStatus.Cancelled,
        });
      },
      isPrivilage: () => isFollowupTaskAllowed,
    },
  ];

  const noFollowups = followupDetails.length === 0;

  return (
    <Modal
      className={`${noFollowups ? "max-w-[420px]" : "max-w-[1600px]"} z-50`}
      isOpen={isOpen}
      onClose={onClose}
      title={`Followup details`}
    >
      {noFollowups ? (
        <p>No followups found!</p>
      ) : (
        <div className="overflow-auto mt-4">
          <DataTable
            data={followupDetails}
            columns={isMobile ? mobileColumns : desktopColumns}
            totalRecords={totalRecords?.TotalRecord ?? 0}
            page={page}
            recordsPerPage={recordsPerPage}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            setRecordsPerPage={setRecordsPerPage}
            contextMenuItems={contextMenuItems}
          />
        </div>
      )}
    </Modal>
  );
}

export default FollowupDetails;
