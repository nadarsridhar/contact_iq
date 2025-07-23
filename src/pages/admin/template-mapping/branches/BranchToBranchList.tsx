import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/pages/admin/template-mapping/branches/columns";
import { ITotalRecords } from "@/utils/interfaces";
import { Branch } from "@/schemas/branch";
import { getBranchesApi } from "@/services/apiBranches";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks";
import { PAGE_ACTION_TYPE } from "@/components/ui/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

function BranchToBranchList({
  branchesToMap,
  setBranchesToMap,
  branches,
  setBranches,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);
  const [mappedPage, setMappedPage] = useState(0);
  const [searchBranchToMap, setSearchBranchToMap] = useState("");
  const [searchMappedBranches, setSearchMappedBranches] = useState("");
  const { recordsPerPage, setRecordsPerPage } = useAuth();

  const [rowAvailableBranchesSelection, setRowAvailableBranchesSelection] =
    useState({});
  const [rowMappedBranchesSelection, setRowMappedBranchesSelection] = useState(
    {}
  );

  const { agent } = useAuth();

  const selectedAvailableBranchesRows = Object.keys(
    rowAvailableBranchesSelection
  ).map((rowId) => {
    return branches.find((row) => row.BranchName === rowId);
  });

  const selectedMappedBranchesRows = Object.keys(
    rowMappedBranchesSelection
  ).map((rowId) => {
    return branchesToMap.find((row) => row.BranchName === rowId);
  });

  const handleBranchMapping = () => {
    if (selectedAvailableBranchesRows?.length === 0) return;
    if (branchesToMap?.length > 0) {
      const commonUsers = selectedAvailableBranchesRows.filter((obj1) =>
        branchesToMap.some((obj2) => obj1.BranchName === obj2.BranchName)
      );
      const newBranches = [
        ...branchesToMap.filter(
          (obj2) =>
            !selectedAvailableBranchesRows.some(
              (obj1) => obj1.BranchName === obj2.BranchName
            )
        ),
        ...selectedAvailableBranchesRows.filter(
          (obj1) =>
            !branchesToMap.some((obj2) => obj1.BranchName === obj2.BranchName)
        ),
      ];
      const branchesToAdd = [...newBranches, ...commonUsers];
      setBranchesToMap(branchesToAdd);
    } else {
      setBranchesToMap(selectedAvailableBranchesRows);
    }
    setRowAvailableBranchesSelection({});

    // if (selectedAvailableBranchesRows?.length === 0) return;
    // if (branchesToMap?.length > 0) {
    //   const newBranchesToAdd = selectedAvailableBranchesRows.filter(
    //     (selectedBranch) =>
    //       !branchesToMap.some(
    //         (existingBranch) =>
    //           existingBranch.BranchName === selectedBranch.BranchName
    //       )
    //   );
    //   setBranchesToMap([...branchesToMap, ...newBranchesToAdd]);
    // } else {
    //   setBranchesToMap(selectedAvailableBranchesRows);
    // }
    // setRowAvailableBranchesSelection({});
  };

  const handleBranchUnmapping = () => {
    if (selectedMappedBranchesRows?.length === 0) return;
    setBranchesToMap((prevList) => {
      return prevList.filter(
        (item) =>
          !selectedMappedBranchesRows.some(
            (filterItem) => item.BranchName === filterItem.BranchName
          )
      );
    });
    setRowMappedBranchesSelection({});
  };

  const fetchBranches = async (payload) => {
    try {
      const { Data: data, MetaData: metaData } =
        (await getBranchesApi(payload)) || {};
      setBranches(data);
      setTotalRecords(metaData);
    } catch (error) {
      console.error(`Error while fetching branches`, error);
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
      UserId: agent.UserId,
      RecordsPerPage: recordsPerPage,
      SearchText: searchBranchToMap,
      StartIndex: nextPageNumber * recordsPerPage,
      BranchName: "",
    };
    fetchBranches(payload);
  };

  const handleMappedPageChange = (type: string) => {
    const nextPageNumber =
      type === PAGE_ACTION_TYPE.PREV ? mappedPage - 1 : mappedPage + 1;
    setMappedPage(nextPageNumber);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        (searchBranchToMap && searchBranchToMap.length > 2) ||
        !searchBranchToMap
      ) {
        const payload = {
          UserId: agent.UserId,
          RecordsPerPage: recordsPerPage,
          SearchText: searchBranchToMap,
          StartIndex: 0,
          BranchName: "",
        };
        fetchBranches(payload);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchBranchToMap, recordsPerPage, agent.UserId]);

  const isMobile = useIsMobile();

  const startIndex = mappedPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const searchedMappedBranches = branchesToMap
    .filter((b) => {
      return (
        b.BranchName?.trim()
          ?.toLowerCase()
          .includes(searchMappedBranches?.trim()?.toLowerCase()) ||
        b.BranchAddress?.trim()
          ?.toLowerCase()
          .includes(searchMappedBranches?.trim()?.toLowerCase())
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
      <div className="flex flex-col gap-7 w-full md:w-2/5 border border-gray-100 p-2 md:p-4 rounded-lg md:rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="font-semibold mr-4">Available Branches</h2>

          <div className="w-full md:max-w-[160px]">
            <Input
              placeholder="Min 3 characters..."
              value={searchBranchToMap}
              onChange={(event) => setSearchBranchToMap(event.target.value)}
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
            tableId="TemMap_AvailableBranches"
            rowSelection={rowAvailableBranchesSelection}
            setRowSelection={setRowAvailableBranchesSelection}
            columns={columns}
            data={branches}
            totalRecords={totalRecords?.TotalRecord || 0}
            page={page}
            recordsPerPage={recordsPerPage}
            getRowId={(row: Branch) => row.BranchName}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            setRecordsPerPage={setRecordsPerPage}
          />
        </div>
      </div>

      <div className="flex md:flex-col gap-4 justify-center m-8 mt-20">
        <Button
          onClick={handleBranchMapping}
          className="bg-green-600 hover:bg-green-500"
        >
          {isMobile ? <ArrowDownIcon /> : <ArrowRightIcon />}
        </Button>

        <Button
          onClick={handleBranchUnmapping}
          className="bg-red-600 hover:bg-red-500"
        >
          {isMobile ? <ArrowUpIcon /> : <ArrowLeftIcon />}
        </Button>
      </div>

      <div className="flex flex-col gap-7 w-full md:w-2/5 border border-gray-100 p-2 md:p-4 rounded-lg md:rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="font-semibold mr-4">Mapped Branches</h2>

          <div className="mb-4 w-full md:max-w-[160px]">
            <Input
              placeholder="Search branches..."
              value={searchMappedBranches}
              onChange={(event) => setSearchMappedBranches(event.target.value)}
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
            tableId="TemMap_MappedBranches1"
            rowSelection={rowMappedBranchesSelection}
            setRowSelection={setRowMappedBranchesSelection}
            columns={columns}
            data={searchedMappedBranches}
            totalRecords={branchesToMap.length}
            page={mappedPage}
            recordsPerPage={recordsPerPage}
            getRowId={(row: Branch) => row.BranchName}
            isLoading={false}
            handlePageChange={handleMappedPageChange}
            setRecordsPerPage={setRecordsPerPage}
          />
        </div>
      </div>
    </div>
  );
}

export default BranchToBranchList;
