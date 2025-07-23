import { desktopColumns, mobileColumns } from "./columns";
import { useIsMobile } from "@/hooks";
import { useEffect, useState } from "react";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { useAuth } from "@/contexts/AuthContext";
import {
  IGetBranchRequestPayload,
  ITagFilter,
  ITotalRecords,
} from "@/utils/interfaces";
import {
  exportUserLoggedInActivityApi,
  getUserActivityReportApi,
  IUserActivityReportPayload,
} from "@/services/apiReports";
import { DataTable } from "@/components/ui/data-table/data-table";
import Export from "../../dashboard/Exports";
import { toast } from "sonner";
import { RefreshCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Filters from "../../dashboard/Filters";
import { getBranchesApi } from "@/services/apiBranches";
import globalState from "@/utils/globalState";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { Badge } from "@/components/ui/badge";

function UserActivityReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState("");
  const [searchedBranch, setSearchedBranch] = useState("");
  const [isFileExporting, setIsFileExporting] = useState(false);
  const [selectedUserCategory, setSelectedUserCategory] = useState([]);
  const [loggedInFilter, setLoggedInFilter] = useState(-1);

  const [reportsData, setReportsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });

  const { agent, token, recordsPerPage, setRecordsPerPage } = useAuth();
  const { isUserActivityReportAllowed, isUserActivityReportExportAllowed } =
    usePrivilege();
  const isMobile = useIsMobile();

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
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: nextPageNumber * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      UserCategory: userCategoryId,
      LoggedInUsers: loggedInFilter,
      BranchName: selectedBranches,
    };

    setIsLoading(true);
    fetchUserActivityReport(payload);
  };

  const handleFileExport = async () => {
    try {
      setIsFileExporting(true);
      const userCategoryId =
        selectedUserCategory.length > 0
          ? selectedUserCategory.reduce(
              (acc, curVal: ITagFilter) => acc + curVal.value,
              0
            )
          : -1;
      const payload = {
        UserId: agent.UserId,
        UserCategory: userCategoryId,
        LoggedInUsers: loggedInFilter,
        BranchName: selectedBranches,
        SearchText: searchText,
      };
      await exportUserLoggedInActivityApi(payload, token);
      toast.success(
        `${globalState.AGENT_NAME} activity report fetched successfully`
      );
    } catch (error) {
      toast.error(
        `Error while fetching ${globalState.AGENT_NAME} activity report`
      );
    } finally {
      setIsFileExporting(false);
    }
  };

  async function fetchUserActivityReport(payload: IUserActivityReportPayload) {
    try {
      const { Data, MetaData: totalRecordsData } =
        (await getUserActivityReportApi(payload)) || {};
      setReportsData(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching user logged in activity report`, error);
    } finally {
      setIsLoading(false);
    }
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

  async function loadUserActivityReport() {
    const defaultPayload = {
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      UserCategory: -1,
      LoggedInUsers: loggedInFilter,
      BranchName: "",
    };

    try {
      setIsLoading(true);
      const { Data, MetaData: totalRecordsData } =
        await getUserActivityReportApi(defaultPayload);
      setReportsData(Data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error(`Error fetching call traffic client details report`, error);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch call records on page mount
  useEffect(() => {
    const userCategoryId =
      selectedUserCategory.length > 0
        ? selectedUserCategory.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const payload = {
      UserId: agent.UserId,
      SearchText: searchText,
      StartIndex: 0,
      RecordsPerPage: recordsPerPage,
      UserCategory: userCategoryId,
      LoggedInUsers: loggedInFilter,
      BranchName: selectedBranches,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchUserActivityReport(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [
    searchText,
    recordsPerPage,
    selectedBranches,
    selectedUserCategory,
    loggedInFilter,
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

  if (!isUserActivityReportAllowed) return null;

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
    <div className="">
      <div className="md:mt-2">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-3xl text-primary font-bold md:mx-4 text-center md:text-left">
            User Activity Report
          </h1>

          {/* Export user activity report */}
          {isUserActivityReportExportAllowed && !isMobile && (
            <Export
              handleFileExport={handleFileExport}
              label={`${globalState.AGENT_NAME} activity report`}
              isExporting={isFileExporting}
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-2 grid grid-cols-2 md:grid-cols-6 gap-4 md:justify-between md:items-center">
            <Filters
              searchText={searchText}
              setSearchText={setSearchText}
              showTags={false}
              comboboxBranches={comboboxBranches}
              selectedBranches={selectedBranches}
              setSelectedBranches={setSelectedBranches}
              setBranchSearchText={setSearchedBranch}
              setSelectedUserCategory={setSelectedUserCategory}
              selectedUserCategory={selectedUserCategory}
              loggedInFilter={loggedInFilter}
              setLoggedInFilter={setLoggedInFilter}
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

          {!isMobile && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  loadUserActivityReport();
                }}
              >
                <RefreshCcw className="h-5 w-5 text-gray-900" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="h-full flex-1 flex-col p-0 mb-4 flex">
        <div className="overflow-auto mt-4">
          <DataTable
            tableId="User_Activity_Report"
            data={reportsData}
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
    </div>
  );
}

export default UserActivityReport;
