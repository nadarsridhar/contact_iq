import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { ITotalRecords } from "@/utils/interfaces";
import { useIsMobile } from "@/hooks";
import { desktopColumns, mobileColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { getUsersApi } from "@/services/apiUser";
import { PAGE_ACTION_TYPE } from "../recent-calls/components/data-table-pagination";
import { UserCategory } from "@/utils/userCategory";

const RECORDS_PER_PAGE = 10;

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>();
  const [page, setPage] = useState(0);

  const { agent } = useAuth();
  const isMobile = useIsMobile();

  async function fetchUsers(payload) {
    try {
      const { Data: data, MetaData: totalRecordsData } = await getUsersApi(
        payload
      );
      setUsers(data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const payload = {
      LoginId: agent.UserId,
      UserCategory: UserCategory.Agent,
      RecordsPerPage: RECORDS_PER_PAGE,
      SearchText: searchText,
      StartIndex: 0,
      UserId: "",
      BranchName: "",
    };

    setIsLoading(true);
    setPage(0);

    const handler = setTimeout(() => fetchUsers(payload), 500);
    return () => clearTimeout(handler);
  }, [agent, searchText]);

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      LoginId: agent.UserId,
      UserCategory: UserCategory.Agent,
      RecordsPerPage: RECORDS_PER_PAGE,
      SearchText: searchText,
      StartIndex: nextPageNumber * RECORDS_PER_PAGE,
      UserId: "",
      BranchName: "",
    };

    setIsLoading(true);
    fetchUsers(payload);
  };

  return (
    <div className=" h-full flex-1 flex-col p-8 pt-0 mb-4 flex overflow-a">
      <div>
        {/* <div className="my-4">
          <Input
            placeholder="Search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="max-w-sm border border-primary"
            isSearch
            onClear={() => setSearchText("")}
          />
        </div> */}
      </div>

      {/* <DataTable
        data={users}
        columns={isMobile ? mobileColumns : desktopColumns}
        totalRecords={null}
        page={page}
        recordsToDisplay={RECORDS_PER_PAGE}
        handlePageChange={handlePageChange}
        isLoading={isLoading}
      /> */}
    </div>
  );
}

export default Users;
