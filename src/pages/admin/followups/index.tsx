import { useEffect, useState } from "react";

import { DataTable } from "@/components/ui/data-table/data-table";
import { desktopColumns, mobileColumns } from "./columns";
import { useAuth } from "@/contexts/AuthContext";
import { ITotalRecords } from "@/utils/interfaces";
import { useIsMobile } from "@/hooks";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { getFollowupsApi, IGetFollowups } from "@/services/apiFollowup";

function Followups() {
  const [followupData, setFollowupData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const { agent, recordsPerPage, setRecordsPerPage } = useAuth();

  async function fetchFollowups(payload: IGetFollowups) {
    try {
      const { Data: data, MetaData: metaData } =
        (await getFollowupsApi(payload)) || {};
      setFollowupData(data);
      setTotalRecords(metaData);
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
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: nextPageNumber * recordsPerPage,
      TagId: -1,
      TaskType: 2,
      Status: -1,
      AutoCalls: -1,
      SearchAttendedId: "",
    };

    setIsLoading(true);
    fetchFollowups(payload);
  };

  useEffect(() => {
    const payload = {
      LoginId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: 0,
      TagId: -1,
      TaskType: 2,
      Status: -1,
      AutoCalls: -1,
      SearchAttendedId: "",
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchFollowups(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, recordsPerPage, agent.UserId]);

  const isMobile = useIsMobile();

  function loadFollowups() {
    const payload = {
      LoginId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchText,
      StartIndex: 0,
      TagId: -1,
      TaskType: 2,
      Status: -1,
      AutoCalls: -1,
      SearchAttendedId: "",
    };

    setIsLoading(true);
    fetchFollowups(payload);
  }

  return (
    <div className="flex flex-col py-2.5">
      <div className={`flex justify-between items-end mb-2 py-4`}>
        <h1
          className={`text-3xl text-primary font-bold md:mx-4 text-center md:text-left`}
        >
          Followups
        </h1>
      </div>
      <div className="rounded-sm mx-1 md:mx-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:justify-between md:items-center">
            {/* <Filters
              searchText={searchText}
              setSearchText={setSearchText}
              showTags={false}
              comboboxBranches={comboboxBranches}
              selectedBranches={selectedBranches}
              setSelectedBranches={setSelectedBranches}
              setBranchSearchText={setSearchedBranch}
            /> */}
            {/* <div className="">
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
            </div> */}
          </div>
        </div>

        <DataTable
          tableId="followups_table"
          columns={isMobile ? mobileColumns : desktopColumns}
          data={followupData}
          totalRecords={totalRecords?.TotalRecord || 0}
          page={page}
          recordsPerPage={recordsPerPage}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
          setRecordsPerPage={setRecordsPerPage}
        />
      </div>
    </div>
  );
}

export default Followups;
