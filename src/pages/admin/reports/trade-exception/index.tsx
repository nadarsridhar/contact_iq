import { useEffect, useMemo, useState } from "react";

import { desktopColumns, mobileColumns } from "./columns";
import { useIsMobile } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { IReportType, ITotalRecords } from "@/utils/interfaces";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import Filters from "../../dashboard/Filters";
import { TRADE_EXCEPTION_REPORT_TYPE } from "@/utils/filter";
import { toast } from "sonner";
import {
  exportTradeExceptionReportApi,
  fetchTradeExceptionReporByOrderApi,
  generateTradeReportApi,
  IGetTradeExceptionReportByOrderPayload,
} from "@/services/apiTradeReport";
import { getDayRangeEpoch } from "@/utils";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { useSearchParams } from "react-router-dom";
import TradeExceptionOrderDetails from "./order-details/TradeExceptionOrderDetails";
import { useTradeReportDetails } from "@/hooks/useTradeReportDetailsModal";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { format } from "date-fns";
import Export from "../../dashboard/Exports";

export enum eTEGeneratorStatus {
  NotYet = 0,
  Generate = 1,
  Pending = 2,
  Failed = 3,
  Completed = 4,
}

export interface ITradeGeneratorPayload {
  Date: number;
  LastUpdateDate: number;
  Reason: string;
  TEGeneratorStatus: number;
  UpdatedBy: string;
}

const initialLastReportStatus = {
  Date: 0,
  LastUpdateDate: 0,
  Reason: "",
  TEGeneratorStatus: eTEGeneratorStatus.NotYet,
  UpdatedBy: "",
};

function getStatus(status: eTEGeneratorStatus) {
  switch (status) {
    case eTEGeneratorStatus.NotYet:
    case eTEGeneratorStatus.Generate:
      return {
        text: "Not generated",
        class: "text-gray-600",
      };

    case eTEGeneratorStatus.Pending:
      return {
        text: "Generating...",
        class: "text-blue-600",
      };
    case eTEGeneratorStatus.Completed:
      return {
        text: "Generated",
        class: "text-green-600",
      };

    case eTEGeneratorStatus.Failed:
      return {
        text: "Failed",
        class: "text-red-600",
      };

    default:
      return { text: "", class: "" };
  }
}

function TradeExceptionReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [alertModalData, setAlertModalData] = useState({});
  const [generateReq, setGenerateReq] = useState(0);
  const [lastReportStatus, setLastReportStatus] =
    useState<ITradeGeneratorPayload>(initialLastReportStatus);
  const [isFileExporting, setIsFileExporting] = useState(false);

  const [reportsData, setReportsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [searchParams] = useSearchParams();
  const currentDate = Number(searchParams.get("date")) * 1000;
  const [selectedDate, setSelectedDate] = useState(() =>
    currentDate ? new Date(currentDate) : new Date()
  );
  const [selectedReportType, setSelectedReportType] = useState<IReportType>(
    TRADE_EXCEPTION_REPORT_TYPE[0]
  );

  const { recordsPerPage, setRecordsPerPage, agent, token } = useAuth();
  const { isTradeExceptionReportAllowed, isTradeExceptionExportImportAllowed } =
    usePrivilege();
  const isMobile = useIsMobile();
  const [StartTime] = getDayRangeEpoch([selectedDate, new Date()]);
  const isTradeExceptionReportFilterSelected =
    selectedReportType.value === TRADE_EXCEPTION_REPORT_TYPE[0].value;
  const { isOpen } = useTradeReportDetails();

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      UserId: agent.UserId,
      StartIndex: nextPageNumber * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      ReportType: selectedReportType.value,
      StartTime,
      SearchText: searchText,
    };
    setIsLoading(true);
    fetchTradeReport(payload);
  };

  const handleFileExport = async () => {
    const payload = {
      UserId: agent.UserId,
      ReportType: selectedReportType.value,
      Date: StartTime,
      SearchText: searchText,
    };

    try {
      setIsFileExporting(true);
      const currentDate = format(new Date(StartTime * 1000), "dd/MM/yyyy");
      const exportedFileName = isTradeExceptionReportFilterSelected
        ? `TradeExceptionReport_${currentDate}.csv`
        : `TradeMatchReport_${currentDate}.csv`;
      await exportTradeExceptionReportApi(payload, token, exportedFileName);
      toast.success(
        `Trade ${
          isTradeExceptionReportFilterSelected ? "exception" : "match"
        } report file downloaded successfully`
      );
    } catch (error) {
      toast.error(
        `Error while fetching trade ${
          isTradeExceptionReportFilterSelected ? "exception" : "match"
        } report file`
      );
    } finally {
      setIsFileExporting(false);
    }
  };

  async function fetchTradeReport(
    payload: IGetTradeExceptionReportByOrderPayload
  ) {
    try {
      const {
        Data,
        MetaData: totalRecordsData,
        TEInfo,
      } = (await fetchTradeExceptionReporByOrderApi(payload)) || {};
      setReportsData(Data);
      setTotalRecords(totalRecordsData);
      if (TEInfo?.TEGeneratorStatus) {
        setLastReportStatus(TEInfo);
        const shouldRegenerateReport =
          TEInfo?.TEGeneratorStatus === eTEGeneratorStatus.Completed ||
          TEInfo?.TEGeneratorStatus === eTEGeneratorStatus.Failed;
        setGenerateReq(shouldRegenerateReport ? 1 : 0);
      } else {
        setLastReportStatus(initialLastReportStatus);
        setGenerateReq(0);
      }
    } catch (error) {
      console.error(`Error fetching user logged in activity report`, error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTradeExceptionReport() {
    const payload = {
      UserId: agent.UserId,
      StartIndex: page * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      ReportType: selectedReportType.value,
      StartTime,
      SearchText: searchText,
    };
    setIsLoading(true);
    fetchTradeReport(payload);
  }

  // Fetch call records on page mount
  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      ReportType: selectedReportType.value,
      StartTime,
      SearchText: searchText,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchTradeReport(payload);
        setAlertModalData({});
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage, selectedReportType.value, StartTime]);

  const handleGenerateTradeExceptionReport = async (regenerate = 0) => {
    try {
      setIsLoading(true);
      const payload = {
        StartTime,
        Regenerate: regenerate,
      };

      const res = await generateTradeReportApi(payload);
      if (res.TEGeneratorStatus === eTEGeneratorStatus.Generate) {
        toast.success(`Your request has been sent. Kindly wait..`);
        setGenerateReq(0);
      } else if (res.TEGeneratorStatus === eTEGeneratorStatus.Pending) {
        toast.warning(`Your trade report is generating. Kindly wait..`);
        setGenerateReq(0);
      } else if (res.TEGeneratorStatus === eTEGeneratorStatus.Failed) {
        setAlertModalData(res);
        setGenerateReq(1);
      } else if (res.TEGeneratorStatus === eTEGeneratorStatus.Completed) {
        setAlertModalData(res);
        setGenerateReq(1);
      }
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
      setGenerateReq(0);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  const isMatchingFilter = (data: ITradeGeneratorPayload) => {
    return data.Date === StartTime;
  };

  useEffect(() => {
    const handler = (e) => {
      const data: ITradeGeneratorPayload = e.detail;
      if (isMatchingFilter(data)) {
        if (data.TEGeneratorStatus === eTEGeneratorStatus.Completed) {
          loadTradeExceptionReport();
        }
        setLastReportStatus(data);
      }
    };

    window.addEventListener("fetch-trade-report", handler);
    return () => window.removeEventListener("fetch-trade-report", handler);
  }, [StartTime]);

  const isRegenerating = generateReq === 1;

  if (!isTradeExceptionReportAllowed) return null;

  const columns = useMemo(() => {
    const cols = [...desktopColumns];
    if (!isTradeExceptionReportFilterSelected) {
      const obj = {
        accessorKey: "StartTime",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="ml-8"
            column={column}
            title="Call Time"
          />
        ),
        cell: ({ row }) => {
          if (row.original.StartTime === 0) return null;

          return (
            <div className="flex items-center ml-8">
              <span className="ml-2">
                {format(
                  new Date(Number(row.original.StartTime) * 1000),
                  "PPpp"
                )}
              </span>
            </div>
          );
        },
      };

      cols.splice(1, 0, obj);
    }
    return cols;
  }, [isTradeExceptionReportFilterSelected]);

  return (
    <div className="p-4">
      <div className="md:mt-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary whitespace-nowrap mb-4">
            Trade Report
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-y-2 md:flex items-center">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pl-0.5 md:justify-between md:items-center">
            <Filters
              showSearchText={false}
              showTags={false}
              showBranches={false}
              showDateRange={false}
              showDatePicker={true}
              setSelectedReportType={setSelectedReportType}
              selectedReportType={selectedReportType}
              datePicker={selectedDate}
              handleDatePicker={setSelectedDate}
            />
          </div>

          <Button
            className="ml-4"
            disabled={
              lastReportStatus.TEGeneratorStatus === eTEGeneratorStatus.Pending
            }
            onClick={() => {
              setOpen(true);
            }}
          >
            {lastReportStatus.TEGeneratorStatus === eTEGeneratorStatus.NotYet
              ? "Generate"
              : "Regenerate"}
          </Button>

          {!isMobile && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  loadTradeExceptionReport();
                }}
              >
                <RefreshCcw className="h-5 w-5 text-gray-900" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-4">
            {/* Export call traffic report */}
            {isTradeExceptionExportImportAllowed && !isMobile && (
              <Export
                handleFileExport={handleFileExport}
                label="Export"
                isExporting={isFileExporting}
              />
            )}

            <p>
              <span>Last status:&nbsp;</span>
              <span
                className={getStatus(lastReportStatus.TEGeneratorStatus).class}
              >
                {getStatus(lastReportStatus.TEGeneratorStatus).text}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="h-full flex-1 flex-col p-0 mb-4 flex">
        <div className="overflow-auto mt-4">
          <DataTable
            data={reportsData}
            columns={isMobile ? mobileColumns : columns}
            totalRecords={totalRecords?.TotalRecord ?? 0}
            page={page}
            recordsPerPage={recordsPerPage}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            setRecordsPerPage={setRecordsPerPage}
          />
        </div>
      </div>

      {isOpen && (
        <TradeExceptionOrderDetails
          selectedReportType={selectedReportType.value}
          startTime={StartTime}
        />
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        {/* Optional Trigger, useful for accessibility */}
        <AlertDialogTrigger asChild>
          <></>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-800 font-semibold">
              Do you want to {isRegenerating ? "regenerate" : "generate"} trade
              exception report? This will take some time.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gray-800 hover:bg-gray-700"
              onClick={() => {
                handleGenerateTradeExceptionReport(generateReq);
                setOpen(false);
              }}
            >
              {isRegenerating ? "Regenerate" : "Generate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TradeExceptionReport;
