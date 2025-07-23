import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/pages/admin/template-mapping/users/columns";
import { ITotalRecords } from "@/utils/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { getUsersApi } from "@/services/apiUser";
import { UserMaster } from "@/schemas/userMaster";
import { useIsMobile } from "@/hooks";
import { UserCategory } from "@/utils/userCategory";
import globalState from "@/utils/globalState";
import { Input } from "@/components/ui/input";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";

function UserToUserList({ users, setUsers, usersToMap, setUsersToMap }) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const [mappedPage, setMappedPage] = useState(0);
  const [searchUsers, setSearchUsers] = useState("");
  const [searchMappedUsers, setSearchMappedUsers] = useState("");
  const { recordsPerPage, setRecordsPerPage } = useAuth();

  const [rowAvailableUsersSelection, setRowAvailableUsersSelection] = useState(
    {}
  );
  const [rowMappedUsersSelection, setRowMappedUsersSelection] = useState({});

  const { agent } = useAuth();

  const selectedAvailableUsersRows = Object.keys(
    rowAvailableUsersSelection
  ).map((rowId) => users.find((row: UserMaster) => row.UserId === rowId));

  const selectedMappedUsersRows = Object.keys(rowMappedUsersSelection).map(
    (rowId) => usersToMap.find((row: UserMaster) => row.UserId === rowId)
  );

  const handleUserMapping = () => {
    if (selectedAvailableUsersRows?.length === 0) return;
    if (usersToMap?.length > 0) {
      const commonUsers = selectedAvailableUsersRows.filter((obj1) =>
        usersToMap.some((obj2) => obj1.UserId === obj2.UserId)
      );
      const newUsers = [
        ...usersToMap.filter(
          (obj2) =>
            !selectedAvailableUsersRows.some(
              (obj1) => obj1.UserId === obj2.UserId
            )
        ),
        ...selectedAvailableUsersRows.filter(
          (obj1) => !usersToMap.some((obj2) => obj1.UserId === obj2.UserId)
        ),
      ];
      const usersToAdd = [...newUsers, ...commonUsers];
      setUsersToMap(usersToAdd);
    } else {
      setUsersToMap(selectedAvailableUsersRows);
    }
    setRowAvailableUsersSelection({});
  };

  const handleUserUnmapping = () => {
    if (selectedMappedUsersRows?.length === 0) return;
    setUsersToMap((prevList: UserMaster[]) => {
      return prevList.filter(
        (item: UserMaster) =>
          !selectedMappedUsersRows.some(
            (filterItem) => item.UserId === filterItem.UserId
          )
      );
    });
    setRowMappedUsersSelection({});
  };

  const fetchUsers = async (payload) => {
    try {
      const { Data: data, MetaData: metaData } =
        (await getUsersApi(payload)) || {};
      setUsers(data);
      setTotalRecords(metaData);
    } catch (error) {
      console.error(`Error while fetching users`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (type: string) => {
    if (isLoading) return;

    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);
    setIsLoading(true);

    const payload = {
      LoginId: agent.UserId,
      UserCategory: UserCategory.Agent,
      RecordsPerPage: recordsPerPage,
      SearchText: searchUsers,
      StartIndex: nextPageNumber * recordsPerPage,
      UserId: "",
      BranchName: "",
    };
    fetchUsers(payload);
  };

  const handleMappedPageChange = (type: string) => {
    const nextPageNumber =
      type === PAGE_ACTION_TYPE.PREV ? mappedPage - 1 : mappedPage + 1;
    setMappedPage(nextPageNumber);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((searchUsers && searchUsers.length > 2) || !searchUsers) {
        const payload = {
          LoginId: agent.UserId,
          UserCategory: UserCategory.Agent,
          RecordsPerPage: recordsPerPage,
          SearchText: searchUsers,
          StartIndex: 0,
          UserId: "",
          BranchName: "",
        };
        fetchUsers(payload);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchUsers, recordsPerPage, agent.UserId]);

  const isMobile = useIsMobile();

  const startIndex = mappedPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const searchedMappedUsers = usersToMap
    .filter((u) => {
      return (
        u.UserId.toLowerCase().includes(searchMappedUsers) ||
        u.UserName.toLowerCase().includes(searchMappedUsers) ||
        u.UserMobileNumber.toLowerCase().includes(searchMappedUsers)
      );
    })
    .slice(startIndex, endIndex);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };


  return (
    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mt-2 mb-16">
      {/* Available Agents */}
      <div className="flex flex-col gap-7 w-full md:w-2/5 border  border-gray-100 p-2 md:p-4 rounded-lg md:rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="font-semibold mr-4">
            Available {globalState.AGENT_NAME_PLURAL}
          </h2>

          <div className="w-full md:max-w-[160px]">
            <Input
              placeholder="Min 3 characters..."
              value={searchUsers}
              onChange={(event) => setSearchUsers(event.target.value)}
              className="w-full md:max-w-sm border border-primary"
              onKeyDown={(e) => {
                handleKeyDown(e);
              }}
              isSearch
            />
          </div>
        </div>

        <div className="">
          <DataTable
            tableId="TemMap_AvailableUsers"
            rowSelection={rowAvailableUsersSelection}
            setRowSelection={setRowAvailableUsersSelection}
            columns={columns}
            data={users}
            totalRecords={totalRecords?.TotalRecord || 0}
            page={page}
            recordsPerPage={recordsPerPage}
            getRowId={(row: UserMaster) => row.UserId}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            setRecordsPerPage={setRecordsPerPage}
          />
        </div>
      </div>

      <div className="flex md:flex-col gap-4 justify-center m-8 mt-20">
        <Button
          onClick={handleUserMapping}
          className="bg-green-600 hover:bg-green-500"
        >
          {isMobile ? <ArrowDownIcon /> : <ArrowRightIcon />}
        </Button>

        <Button
          onClick={handleUserUnmapping}
          className="bg-red-600 hover:bg-red-500"
        >
          {isMobile ? <ArrowUpIcon /> : <ArrowLeftIcon />}
        </Button>
      </div>

      {/* Mapped Agents */}
      <div className="flex flex-col gap-7 w-full md:w-2/5 border border-gray-100 p-2 md:p-4 rounded-lg md:rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="font-semibold mr-4">
            Mapped {globalState.AGENT_NAME_PLURAL}
          </h2>

          <div className="mb-4 w-full md:max-w-[160px]">
            <Input
              placeholder="Search users..."
              value={searchMappedUsers}
              onChange={(event) => setSearchMappedUsers(event.target.value)}
              className="w-full md:max-w-sm border border-primary"
              onKeyDown={(e) => {
                handleKeyDown(e);
              }}
              isSearch
            />
          </div>
        </div>

        <div className="">
          <DataTable
            tableId="TemMap_MappedUsers1"
            rowSelection={rowMappedUsersSelection}
            setRowSelection={setRowMappedUsersSelection}
            columns={columns}
            data={searchedMappedUsers}
            totalRecords={usersToMap.length}
            page={mappedPage}
            recordsPerPage={recordsPerPage}
            getRowId={(row: UserMaster) => row.UserId}
            isLoading={false}
            handlePageChange={handleMappedPageChange}
            setRecordsPerPage={setRecordsPerPage}
          />
        </div>
      </div>
    </div>
  );
}

export default UserToUserList;
