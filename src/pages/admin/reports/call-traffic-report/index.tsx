import { desktopColumns, mobileColumns } from "./columns";
import { getDayRangeEpoch } from "@/lib/utils";
import { useIsMobile } from "@/hooks";
import { useEffect, useState } from "react";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { useAuth } from "@/contexts/AuthContext";
import { IGetBranchRequestPayload, ITotalRecords } from "@/utils/interfaces";
import {
  exportCallTrafficReportApi,
  getCallTrafficReportApi,
  ICallTrafficReportPayload,
} from "@/services/apiReports";
import { DataTable } from "@/components/ui/data-table/data-table";
import Export from "../../dashboard/Exports";
import { toast } from "sonner";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import Filters from "../../dashboard/Filters";
import { RefreshCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CallTrafficClientDetails from "./client-details/CallTrafficClientDetails";
import { useCallTrafficClientDetailsModal } from "@/hooks/useCallTrafficModal";
import { getBranchesApi } from "@/services/apiBranches";
import { Badge } from "@/components/ui/badge";

function CallTrafficReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [branches, setBranches] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [isFileExporting, setIsFileExporting] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState("");
  const [searchedBranch, setSearchedBranch] = useState("");

  const [callTrafficReports, setCallTraffficReports] = useState([]);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });

  const { agent, token, recordsPerPage, setRecordsPerPage } = useAuth();
  const isMobile = useIsMobile();
  const { isCallTrafficExportAllowed, isCallTrafficReportAllowed } =
    usePrivilege();
  const { isOpen, data } = useCallTrafficClientDetailsModal();

  // Date filter change event
  const handleRangeChange = (range: Date[]) => {
    setDateRange(range); // Update the state with the selected date range
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(range);

    const payload = {
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
    };

    fetchCallTrafficReport(payload);
  };

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);

    const payload = {
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: nextPageNumber * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
    };

    setIsLoading(true);
    fetchCallTrafficReport(payload);
  };

  const handleFileExport = async () => {
    try {
      setIsFileExporting(true);
      const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);

      const payload = {
        SearchText: searchText,
        UserId: agent.UserId,
        StartTime: startDateEpoch,
        EndTime: endDateEpoch,
        BranchName: selectedBranches,
      };
      await exportCallTrafficReportApi(payload, token);
      toast.success(`Call traffic report fetched successfully`);
    } catch (error) {
      toast.error(`Error while fetching call traffic report`);
    } finally {
      setIsFileExporting(false);
    }
  };

  async function fetchBranchList(payload: IGetBranchRequestPayload) {
    const { Data: data, MetaData: metaData } = await getBranchesApi(payload);
    setBranches(data);
  }

  // Fetch call records
  async function fetchCallTrafficReport(payload: ICallTrafficReportPayload) {
    try {
      const { Data, MetaData: totalRecordsData } =
        (await getCallTrafficReportApi(payload)) || {};
      setCallTraffficReports(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching call traffic report`, error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCallTrafficReport() {
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const defaultPayload = {
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
    };

    try {
      setIsLoading(true);
      const { Data, MetaData: totalRecordsData } =
        await getCallTrafficReportApi(defaultPayload);
      setCallTraffficReports(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching call traffic client details report`, error);
    } finally {
      setIsLoading(false);
    }
  }

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

  // Fetch call records on page mount
  useEffect(() => {
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const payload = {
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchCallTrafficReport(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, dateRange, recordsPerPage, selectedBranches]);

  if (!isCallTrafficReportAllowed) return null;

  const comboboxBranches = [{ label: "All", value: "All" }];
  branches?.forEach((branch) => {
    comboboxBranches.push({
      label: branch.BranchName,
      value: branch.BranchName,
    });
  });

  function handleClearFilters() {
    setSearchText("");
    setSelectedBranches("All");
    setDateRange([new Date(), new Date()]);
  }

  const showClearFilterButton =
    searchText !== "" ||
    (selectedBranches && selectedBranches !== "All") ||
    (dateRange !== null &&
      dateRange?.length > 0 &&
      dateRange[0].toLocaleDateString() !== new Date().toLocaleDateString());

  return (
    <div className="">
      <div className="md:mt-2">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-primary whitespace-nowrap mb-4">
            Call Traffic Report
          </h1>

          {/* Export call traffic report */}
          {isCallTrafficExportAllowed && !isMobile && (
            <Export
              handleFileExport={handleFileExport}
              label="Call Records"
              isExporting={isFileExporting}
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-2 grid grid-cols-2 md:grid-cols-6 gap-4 md:justify-between md:items-center">
            <Filters
              searchText={searchText}
              setSearchText={setSearchText}
              dateRange={dateRange}
              handleRangeChange={handleRangeChange}
              showTags={false}
              comboboxBranches={comboboxBranches}
              selectedBranches={selectedBranches}
              setSelectedBranches={setSelectedBranches}
              setBranchSearchText={setSearchedBranch}
              showDateRange
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

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                loadCallTrafficReport();
              }}
            >
              <RefreshCcw className="h-5 w-5 text-gray-900" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="h-full flex-1 flex-col p-0 mb-4 flex">
        {/* Call records table */}
        <div className="overflow-auto mt-4">
          <DataTable
            tableId="Call_Trafic_Report"
            data={callTrafficReports}
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

      {isOpen && (
        <CallTrafficClientDetails
          dateRange={getDayRangeEpoch(dateRange)}
          selectedBranches={selectedBranches}
        />
      )}
    </div>
  );
}

export default CallTrafficReport;
