import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { useCallTrafficClientDetailsModal } from "@/hooks/useCallTrafficModal";
import { DataTable } from "@/pages/recent-calls/components/data-table";
import { ITotalRecords } from "@/utils/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_ACTION_TYPE } from "@/pages/recent-calls/components/data-table-pagination";
import {
  exportCallTrafficClientReportApi,
  getCallTrafficClientReportApi,
  ICallTrafficReportPayload,
} from "@/services/apiReports";
import { desktopColumns, mobileColumns } from "./columns";
import { Input } from "@/components/ui/input";
import Export from "@/pages/admin/dashboard/Exports";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks";

function CallTrafficClientDetails({ dateRange, selectedBranches = "" }) {
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [clientDetailsReport, setClientDetailsReport] = useState([]);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const [isFileExporting, setIsFileExporting] = useState(false);

  const { isOpen, onClose, data } = useCallTrafficClientDetailsModal();
  const { action, modalData = {} } = data.data || {};
  const { agent, recordsPerPage, setRecordsPerPage, token } = useAuth();
  const isMobile = useIsMobile();
  const { SpecificUserId = "", StartTime = 0, EndTime = 0 } = modalData;

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      UserId: agent.UserId,
      SpecificUserId,
      StartIndex: nextPageNumber * recordsPerPage,
      SearchText: searchText,
      RecordsPerPage: recordsPerPage,
      StartTime: dateRange[0],
      EndTime: dateRange[1],
      BranchName: selectedBranches,
    };

    setIsLoading(true);
    fetchClientDetailsCallTrafficReport(payload);
  };

  // Fetch call records
  async function fetchClientDetailsCallTrafficReport(
    payload: ICallTrafficReportPayload
  ) {
    try {
      const { Data, MetaData: totalRecordsData } =
        (await getCallTrafficClientReportApi(payload)) || {};
      setClientDetailsReport(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching call traffic report`, error);
    } finally {
      setIsLoading(false);
    }
  }

  // Export call records
  async function exportCallTrafficClientReport() {
    const payload = {
      UserId: agent.UserId,
      SpecificUserId,
      SearchText: searchText,
      StartTime: dateRange[0],
      EndTime: dateRange[1],
      BranchName: selectedBranches,
    };

    try {
      setIsFileExporting(true);
      await exportCallTrafficClientReportApi(payload, token);
      toast.success(
        `Call traffic client details report  downloaded successfully!`
      );
    } catch (error) {
      toast.error(`Failed to download call traffic client details report`);
    } finally {
      setIsFileExporting(false);
    }
  }

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      SpecificUserId,
      SearchText: searchText,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      StartTime: dateRange[0],
      EndTime: dateRange[1],
      BranchName: selectedBranches,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchClientDetailsCallTrafficReport(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage, selectedBranches])

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      title={`Client Details for ${SpecificUserId}`}
    >
      <div className="max-h-[70vh] space-x-2 overflow-auto">
        <div className="flex p-2 items-center">
          <Input
            placeholder="Min 3 characters.."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="max-w-sm border border-stale-200"
            isSearch
          />
          {!isMobile && (
            <Export
              handleFileExport={exportCallTrafficClientReport}
              label="Export"
              isExporting={isFileExporting}
            />
          )}
        </div>
        {/* Client details records table */}
        <div className="mt-4">
          <DataTable
            HideContextMenu={true}
            tableId="Client_Details"
            data={clientDetailsReport}
            columns={isMobile ? mobileColumns : desktopColumns}
            totalRecords={totalRecords?.TotalRecord ?? 0}
            page={page}
            recordsPerPage={recordsPerPage}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            setRecordsPerPage={setRecordsPerPage}
          />
        </div>
      </div>
    </Modal>
  );
}

export default CallTrafficClientDetails;
