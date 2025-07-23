import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { DataTable } from "@/pages/recent-calls/components/data-table";
import { ITotalRecords } from "@/utils/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_ACTION_TYPE } from "@/pages/recent-calls/components/data-table-pagination";
import { desktopColumns, mobileColumns } from "./columns";
import { useIsMobile } from "@/hooks";
import { useTradeReportDetails } from "@/hooks/useTradeReportDetailsModal";
import {
  fetchTradeExceptionReportByTradeApi,
  IGetTradeExceptionReportByOrderPayload,
} from "@/services/apiTradeReport";

function TradeExceptionOrderDetails({
  selectedReportType,
  startTime,
}: {
  selectedReportType: number;
  startTime: number;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [reportData, setReportData] = useState([]);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const [isFileExporting, setIsFileExporting] = useState(false);

  const { isOpen, onClose, data } = useTradeReportDetails();
  const { orderDetails = {} } = data.data?.modalData || {};
  const { agent, recordsPerPage, setRecordsPerPage, token } = useAuth();
  const isMobile = useIsMobile();

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      UserId: agent.UserId,
      StartIndex: nextPageNumber * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      ReportType: selectedReportType,
      SearchText: searchText,
      StartTime: startTime,
      OrderNumber: orderDetails.OrderNumber,
    };

    setIsLoading(true);
    fetchTradeExceptionReportByOrder(payload);
  };

  // Fetch call records
  async function fetchTradeExceptionReportByOrder(
    payload: IGetTradeExceptionReportByOrderPayload
  ) {
    try {
      const { Data, MetaData: totalRecordsData } =
        (await fetchTradeExceptionReportByTradeApi(payload)) || {};
      setReportData(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching call traffic report`, error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      ReportType: selectedReportType,
      SearchText: searchText,
      StartTime: startTime,
      OrderNumber: orderDetails.OrderNumber,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchTradeExceptionReportByOrder(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage, startTime]);

  return (
    <Modal
      className="max-w-[1600px] "
      isOpen={isOpen}
      onClose={onClose}
      title={`Order details for ${orderDetails?.OrderNumber}`}
    >
      {/* Client details records table */}
      <div className="overflow-auto mt-4">
        <DataTable
          data={reportData}
          columns={isMobile ? mobileColumns : desktopColumns}
          totalRecords={totalRecords?.TotalRecord ?? 0}
          page={page}
          recordsPerPage={recordsPerPage}
          isLoading={isLoading}
          handlePageChange={handlePageChange}
          setRecordsPerPage={setRecordsPerPage}
        />
      </div>
    </Modal>
  );
}

export default TradeExceptionOrderDetails;
