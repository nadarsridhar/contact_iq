import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import "rsuite/dist/rsuite.min.css";

import { getAdminCallStats, getCallsApi } from "@/services/apiCalls";
import { useAuth } from "@/contexts/AuthContext";
import {
  VTS_SOCKET_ADMIN_CALL_CHANNEL,
  VTS_SOCKET_AGENT_CALL_CHANNEL,
} from "@/utils/constants";
import {
  IAdminStats,
  ICallFilter,
  IExportCallRequestPayload,
  IGetBranchRequestPayload,
  ITagFilter,
  ITotalRecords,
} from "@/utils/interfaces";
import { CALL_CATEGORY_FILTER } from "@/utils/filter";
import downloadFile from "@/utils/downloadFile";
import { DataTable } from "@/pages/recent-calls/components/data-table";
import { useEditHistory, useIsMobile, useThrottle } from "@/hooks";

import Stats from "@/pages/admin/dashboard/Stats";
import Filters from "@/pages/admin/dashboard/Filters";
import {
  desktopColumns,
  mobileColumns,
} from "@/pages/recent-calls/components/admin-columns";
import { PAGE_ACTION_TYPE } from "@/pages/recent-calls/components/data-table-pagination";

import { CallStatusState, getDayRangeEpoch } from "@/utils";
import Export from "@/pages/admin/dashboard/Exports";
import { Combobox } from "@/components/ui/combobox";
import { getUsersApi } from "@/services/apiUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientMaster from "../clients";
import UserMaster from "../users";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RefreshCcw, X } from "lucide-react";
import { getBranchesApi } from "@/services/apiBranches";
import globalState from "@/utils/globalState";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { UserCategory } from "@/utils/userCategory";
import { DataTableColumnHeader } from "@/pages/clients/components/data-table-column-header";
import { RecordingModal } from "@/components/RecordingModal";
import { Badge } from "@/components/ui/badge";
import { EditCallerInfoDialog } from "@/components/EditCallerInfoDialog";
import {
  useCreateFollowup,
  useFollowupDetails,
} from "@/hooks/useCreateFollowup";
import FollowupDetails from "@/components/followups/followup-details";
import { ACTIONS } from "@/utils/actions";

const initialFilters = {
  CallStatus: -1,
  CallType: -1,
};

const initialAdminStats = {
  ActiveCalls: 0,
  PeakCalls: 0,
  ActiveChannel: 0,
  IncomingCalls: 0,
  OutgoingCalls: 0,
  PeakCallTime: 0,
  PeakChannel: 0,
  PeakChannelTime: 0,
  TotalCallDuration: 0,
  TotalCalls: 0,
};

export enum EXPORT_TYPES {
  CALL_LOGS = 0,
  CALL_RECORDINGS = 1,
}

enum TabState {
  RECENT_CALLS = "recent-calls",
  CLIENTS = "clients",
  USERS = "users",
  STATS = "stats",
}

export default function AdminDashboard() {
  const {
    socket,
    agent,
    isWebSocketConnected,
    token,
    isSuperAdmin,
    isBranchAdmin,
    recordsPerPage,
    setRecordsPerPage,
    isTabActive,
  } = useAuth();
  const {
    isClientReadAllowed,
    isUserReadAllowed,
    isUsersFilterAllowed,
    isRecordingExportImportAllowed,
    isCallsExportImportAllowed,
    isSearchFilterAllowed,
    isDateFilterAllowed,
    isStatusFilterAllowed,
    isTagsFilterAllowed,
    isBranchFilterAllowed,
    isPhoneNumberAllowed,
  } = usePrivilege();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState(TabState.RECENT_CALLS);
  const [isLoading, setIsLoading] = useState(false);
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState<IAdminStats>(initialAdminStats);
  const [isCallsExporting, setIsCallsExporting] = useState(false);
  const [isRecordingsExporting, setIsRecordingsExporting] = useState(false);

  const [totalRecords, setTotalRecords] = useState<ITotalRecords>({
    Result: 0,
    TotalRecord: 0,
  });
  const [page, setPage] = useState(0);

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedCallFilter, setSelectedCallFilter] = useState<ICallFilter>(
    CALL_CATEGORY_FILTER[0]
  );

  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState("");
  const [searchedBranch, setSearchedBranch] = useState("");

  const [searchedAgent, setSearchedAgent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");

  const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);

  const {
    isUpdateCallDetailsAllowed,
    isRecordingDownloadAllowed,
    isFollowupTaskAllowed,
  } = usePrivilege();
  const { onOpen: openCreateFollowupDialog, setData: setCreateFollowupTask } =
    useCreateFollowup();
  const { onOpen: openFollowupDetailsDialog, setData: setFollowupDetailsData } =
    useFollowupDetails();
  const { onOpen: handleEditDialogOpen, setData: setUpdateClientDetailsData } =
    useEditHistory();

  // Date filter change event
  const handleRangeChange = (range: Date[]) => {
    setDateRange(range); // Update the state with the selected date range
  };

  // Fetch call records
  async function fetchCalls(payload) {
    payload = {
      ...payload,
      UserIds: payload.UserIds === "All" ? "" : payload.UserIds,
    };
    try {
      const { Data: callsData, MetaData: totalRecordsData } =
        (await getCallsApi(payload)) || {};
      setCalls(callsData);
      // setTotalRecords(totalRecordsData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch admin stats
  async function fetchAdminCallStats() {
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const tagId =
      selectedTags.length > 0
        ? selectedTags.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const data = await getAdminCallStats({
      UserId: agent.UserId,
      TagId: tagId,
      CallStatus: filters.CallStatus,
      CallType: filters.CallType,
      SearchText: searchText,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
      UserIds: selectedAgent === "All" ? "" : selectedAgent,
    });

    setTotalRecords({
      Result: 0,
      TotalRecord: data.TotalCalls,
    });
    setStats(data);
  }
  const throttledFetchAdminCallStats = useThrottle(fetchAdminCallStats, 2000);

  // Fetch call records on page mount
  useEffect(() => {
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const tagId =
      selectedTags.length > 0
        ? selectedTags.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;
    const payload = {
      UserId: agent.UserId,
      CallStatus: filters.CallStatus,
      CallType: filters.CallType,
      SearchText: searchText,
      StartIndex: 0,
      TagId: tagId,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
      UserIds: selectedAgent,
    };

    const handler = setTimeout(() => {
      if ((searchText && searchText.length > 2) || !searchText) {
        setIsLoading(true);
        setPage(0);
        fetchAdminCallStats();
        fetchCalls(payload);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [
    searchText,
    filters,
    dateRange,
    selectedTags,
    isMobile,
    recordsPerPage,
    selectedBranches,
    selectedAgent,
    isTabActive,
  ]);

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const tagId =
      selectedTags.length > 0
        ? selectedTags.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;
    const payload = {
      UserId: agent.UserId,
      CallStatus: filters.CallStatus,
      CallType: filters.CallType,
      TagId: tagId,
      BranchName: selectedBranches,
      SearchText: searchText,
      StartIndex: nextPageNumber * recordsPerPage,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      UserIds: selectedAgent === "All" ? "" : selectedAgent,
    };

    setIsLoading(true);
    fetchAdminCallStats();
    fetchCalls(payload);
  };

  function matchFilter({
    ClientName,
    ClientNumber,
    ClientId,
    BranchName,
    UserId,
    CallStatus,
    CallType,
    TagId,
    EndTime,
    StartTime,
  }) {
    const isIncomingCall = CallStatus === CallStatusState.INCOMING;
    const [_, todaysEndDateEpoch] = getDayRangeEpoch([new Date(), new Date()]);
    const matchDateRange =
      StartTime >= startDateEpoch &&
      (todaysEndDateEpoch === endDateEpoch
        ? true
        : EndTime !== 0
        ? EndTime <= endDateEpoch
        : false);

    // Add incoming calls in table if within the date range filter
    // if (isIncomingCall && matchDateRange) return true;

    const SelectedTagsId =
      selectedTags.length > 0
        ? selectedTags.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const matchSearchTextFilter =
      searchText === "" ||
      ClientName.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
      ClientNumber.toLocaleLowerCase().includes(
        searchText.toLocaleLowerCase()
      ) ||
      ClientId.toLowerCase().includes(searchText.toLowerCase()) ||
      BranchName.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
      UserId.toLowerCase().includes(searchText.toLocaleLowerCase());
    const matchCallStatusFilter =
      filters.CallStatus === -1 || CallStatus === filters.CallStatus;
    const matchCallTypeFilter =
      filters.CallType === -1 || (CallType & filters.CallType) === CallType;
    const matchTagFilter = SelectedTagsId === -1 || SelectedTagsId === TagId;
    const matchBranchFilter =
      selectedBranches === "All" ||
      selectedBranches === BranchName ||
      selectedBranches === "";
    const matchUserFilter =
      selectedAgent === "All" ||
      selectedAgent === UserId ||
      selectedAgent === "";

    const result =
      matchDateRange &&
      matchCallStatusFilter &&
      matchCallTypeFilter &&
      matchTagFilter &&
      matchBranchFilter &&
      matchUserFilter &&
      matchSearchTextFilter;

    return result;
  }

  // Listen for live call web socket events
  useEffect(() => {
    if (!isWebSocketConnected) return;
    const socketChannel =
      isBranchAdmin || isSuperAdmin
        ? VTS_SOCKET_ADMIN_CALL_CHANNEL
        : VTS_SOCKET_AGENT_CALL_CHANNEL;

    const handleSocketMessage = async (data) => {
      console.log("Admin socket data received: ", data.message);
      const {
        AnsweredFlag,
        BranchId,
        BranchName,
        CallStatus,
        CallType,
        ClientId,
        ClientName,
        ClientNumber,
        UserName,
        Duration,
        EndTime,
        Feedback,
        LastUpdateDate,
        Remarks,
        RecordingName,
        RecordingPath,
        RecordingURL,
        SessionId,
        StartTime,
        DealerChannel,
        CreatedDate,
        UniqueCallIdentifier,
        UserId,
        UserNumber,
        TagId,
        UpdatedBy,
        WebRTCCall,
        TaggedClientIds,
        FollowupId,
        IsDialpadCall,
        ValidUserList,
        IsFollowupScheduled,
      } = data.message;

      // Fetch admin call stats with given buffer
      throttledFetchAdminCallStats();

      const callPayload = {
        UniqueCallIdentifier,
        BranchId,
        BranchName,
        CallStatus,
        CallType,
        ClientId,
        ClientName,
        ClientNumber,
        CreatedDate,
        DealerChannel,
        UserName,
        Duration,
        EndTime,
        Feedback,
        Remarks,
        SessionId,
        LastUpdateDate,
        StartTime,
        UserId,
        AnsweredFlag,
        UserNumber,
        RecordingName,
        RecordingPath,
        RecordingURL,
        WebRTCCall,
        TagId,
        UpdatedBy,
        TaggedClientIds,
        FollowupId,
        IsDialpadCall,
        ValidUserList,
        IsFollowupScheduled,
      };

      setCalls((prevData) => {
        const existingIndex = prevData?.findIndex(
          (c) => c?.UniqueCallIdentifier === UniqueCallIdentifier
        );

        if (existingIndex !== -1) {
          const newData = [...prevData];

          // Update existing record
          if (matchFilter(callPayload)) {
            newData[existingIndex] = { ...callPayload };
          }
          // Delete existing record
          else {
            newData.splice(existingIndex, 1);
          }
          return newData;
        }

        // Add fresh call record
        if (matchFilter(callPayload)) return [callPayload, ...prevData];
        else {
          return prevData;
        }
      });
    };

    socket.on(socketChannel, handleSocketMessage);
    return () => socket.off(socketChannel, handleSocketMessage);
  }, [
    isWebSocketConnected,
    isBranchAdmin,
    isSuperAdmin,
    searchText,
    filters,
    selectedTags,
    selectedBranches,
    selectedAgent,
    isTabActive,
    dateRange,
  ]);

  // Fetch mapped agents for team manager for filter dropdown
  useEffect(() => {
    const payload = {
      LoginId: agent.UserId,
      UserCategory: UserCategory.Agent,
      RecordsPerPage: 5,
      SearchText: "",
      StartIndex: 0,
      UserId: searchedAgent,
      BranchName: "",
    };

    const handler = setTimeout(() => {
      if ((searchedAgent && searchedAgent.length > 2) || !searchedAgent) {
        fetchUsers(payload);
      }
    }, 500);
    return () => clearTimeout(handler);

    // if (isUsersFilterAllowed) fetchUsers(payload);
  }, [isUsersFilterAllowed, recordsPerPage, searchedAgent]);

  // Handle call status filter change
  const handleFilterChange = (selectedFilter) => {
    setSelectedCallFilter(selectedFilter);
    setFilters({
      CallStatus: selectedFilter.value.CallStatus,
      CallType: selectedFilter.value.CallType,
    });
  };

  // Fetch users
  async function fetchUsers(payload) {
    if (!isUsersFilterAllowed) return;
    const { Data: data, MetaData: totalRecordsData } =
      (await getUsersApi(payload)) || {};
    setUsers(data);
    // setTotalRecords(totalRecordsData);
  }

  // Export call records
  async function exportCallRecords(payload: IExportCallRequestPayload) {
    payload = {
      ...payload,
      BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
      UserIds: payload.UserIds === "All" ? "" : payload.UserIds,
    };

    try {
      setIsCallsExporting(true);
      await downloadFile(
        "v1/exports/callLogs",
        payload,
        "CallRecords.csv",
        token
      );
      toast.success(`Call records file downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to download call records file`);
    } finally {
      setIsCallsExporting(false);
    }
  }

  // Export call recordings
  async function exportCallRecordings(payload: IExportCallRequestPayload) {
    payload = {
      ...payload,
      BranchName: payload.BranchName === "All" ? "" : payload.BranchName,
      UserIds: payload.UserIds === "All" ? "" : payload.UserIds,
    };

    try {
      setIsRecordingsExporting(true);
      await downloadFile(
        "v1/recordings/exportRecordings",
        payload,
        "call-recordings.zip",
        token
      );
      toast.success(`Call recordings downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to download call recordings`);
    } finally {
      setIsRecordingsExporting(false);
    }
  }

  const handleFileExport = async (exportType: EXPORT_TYPES) => {
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const tagId =
      selectedTags.length > 0
        ? selectedTags.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;
    const payload = {
      SearchText: searchText,
      UserId: agent.UserId,
      CallStatus:
        exportType === EXPORT_TYPES.CALL_RECORDINGS
          ? CallStatusState.HANGUP
          : filters.CallStatus,
      CallType: filters.CallType,
      TagId: tagId,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
      UserIds: selectedAgent,
    };

    if (exportType === EXPORT_TYPES.CALL_LOGS) exportCallRecords(payload);
    else if (exportType === EXPORT_TYPES.CALL_RECORDINGS)
      exportCallRecordings(payload);
  };

  // Mapped agent combobox list for Branch Admin
  const mappedAgents = [{ label: "All", value: "All" }];
  users?.forEach(({ UserId }) => {
    mappedAgents.push({
      label: UserId,
      value: UserId,
    });
  });

  function loadCallLogs() {
    const [startDateEpoch, endDateEpoch] = getDayRangeEpoch(dateRange);
    const tagId =
      selectedTags.length > 0
        ? selectedTags.reduce(
            (acc, curVal: ITagFilter) => acc + curVal.value,
            0
          )
        : -1;

    const payload = {
      UserId: agent.UserId,
      CallStatus: filters.CallStatus,
      CallType: filters.CallType,
      SearchText: searchText,
      StartIndex: page * recordsPerPage,
      TagId: tagId,
      RecordsPerPage: recordsPerPage,
      StartTime: startDateEpoch,
      EndTime: endDateEpoch,
      BranchName: selectedBranches,
      UserIds: selectedAgent,
    };

    setIsLoading(true);
    fetchCalls(payload);
    fetchAdminCallStats();
  }

  // Fetch daily records after create follow up modal is close
  const { isOpen } = useCreateFollowup();
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        loadCallLogs();
      }, 1000);
    }
  }, [isOpen]);

  async function fetchBranchList(payload: IGetBranchRequestPayload) {
    const { Data: data, MetaData: metaData } = await getBranchesApi(payload);
    setBranches(data);
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

  const comboboxBranches = [{ label: "All", value: "All" }];
  branches?.forEach((branch) => {
    comboboxBranches.push({
      label: branch.BranchName,
      value: branch.BranchName,
    });
  });

  const columns = useMemo(() => {
    const cols = [...desktopColumns];
    
    if (isPhoneNumberAllowed) {
      const obj = {
        accessorKey: "ClientNumber",
        header: ({ column }) => (
          <DataTableColumnHeader className="flex items-center justify-start" column={column} title="Client Number" />
        ),
        enableResizing: true,
        size: 60,
        minSize: 65,
        maxSize: 300,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-start">
              <span className="turncate">{row.original.ClientNumber}</span>
            </div>
          );
        },
      };
      cols.splice(5, 0, obj);
    }
    return cols;
  }, [calls]);

  function handleClearFilters() {
    setSearchText("");
    setSelectedTags([]);
    setDateRange([new Date(), new Date()]);
    setSelectedCallFilter(CALL_CATEGORY_FILTER[0]);
    setSelectedBranches("All");
    setSelectedAgent("");
    setFilters(initialFilters);
  }

  const showClearFilterButton =
    searchText !== "" ||
    (selectedCallFilter?.key && selectedCallFilter.key !== "All") ||
    selectedTags.length !== 0 ||
    (selectedBranches && selectedBranches !== "All") ||
    (selectedAgent && selectedAgent !== "" && selectedAgent !== "All") ||
    (dateRange !== null &&
      dateRange?.length > 0 &&
      dateRange[0].toLocaleDateString() !== new Date().toLocaleDateString());

  const downloadAudio = async (RecordingName: string) => {
    try {
      await downloadFile(
        "v1/recordings/getRecording",
        { RecordingName },
        RecordingName,
        token
      );
    } catch (error) {
      console.error(`Error while downloading audio`);
    }
  };

  const contextMenuItems = [
    {
      label: "Edit",
      onClick: (row) => {
        handleEditDialogOpen();
        setUpdateClientDetailsData(row.original);
      },
      isPrivilage: () => {
        return isUpdateCallDetailsAllowed;
      },
    },
    {
      label: "Download Recording",
      onClick: (row) => {
        downloadAudio(row.original.RecordingName);
      },
      isPrivilage: (row) => {
        return (
          isRecordingDownloadAllowed &&
          Number(row.original.CallStatus) === CallStatusState.HANGUP
        );
      },
    },
    {
      label: "Create followup",
      onClick: (row) => {
        // Open create followup dialog
        openCreateFollowupDialog();
        setCreateFollowupTask({
          ...row.original,
          OperationCode: ACTIONS.CREATE,
        });
      },
      isPrivilage: () => isFollowupTaskAllowed,
    },
    {
      label: "View followup",
      onClick: (row) => {
        openFollowupDetailsDialog();
        setFollowupDetailsData(row.original);
      },
      isPrivilage: () => isFollowupTaskAllowed,
    },
  ];

  return (
    <div className="md:py-4 px-1 md:p-4 md:pt-0">
      <div className="flex justify-between items-center md:mt-2">
        {!isMobile && (
          <h1 className="textAgent text-3xl font-bold text-primary whitespace-nowrap">
            {isSuperAdmin || isBranchAdmin ? "Admin" : globalState.AGENT_NAME}{" "}
            Dashboard 
          </h1>
        )}

        {/* Export recordings and call records */}
        {!isMobile && (
          <div className="flex justify-end gap-4 items-center w-full">
            {isCallsExportImportAllowed && (
              <Export
                handleFileExport={() =>
                  handleFileExport(EXPORT_TYPES.CALL_LOGS)
                }
                label="Calls"
                isExporting={isCallsExporting}
              />
            )}
            {isRecordingExportImportAllowed && (
              <Export
                handleFileExport={() =>
                  handleFileExport(EXPORT_TYPES.CALL_RECORDINGS)
                }
                label="Recordings"
                isExporting={isRecordingsExporting}
              />
            )}
          </div>
        )}
      </div>

      <Tabs
        defaultValue={TabState.RECENT_CALLS}
        className="pt-5 flex flex-col gap-2"
        onValueChange={(t: TabState) => setActiveTab(t)}
      >
        {isMobile && (
          <TabsList
            className={`grid grid-cols-3 place-content-center p-0 gap-2.5 bg-white md:w-1/4`}
          >
            <TabsTrigger value={TabState.RECENT_CALLS} className="p-0">
              <Button
                variant={
                  activeTab === TabState.RECENT_CALLS ? `default` : `ghost`
                }
                className={`${
                  activeTab === TabState.RECENT_CALLS ? "" : "border"
                } w-full p-4`}
              >
                Dashboard
              </Button>
            </TabsTrigger>

            {isUserReadAllowed && !isMobile ? (
              <TabsTrigger value={TabState.USERS} className="p-0">
                <Button
                  variant={activeTab === TabState.USERS ? `default` : `ghost`}
                  className="w-full border"
                >
                  {globalState.AGENT_NAME}
                </Button>
              </TabsTrigger>
            ) : null}
            {isMobile ? (
              <TabsTrigger value={TabState.STATS} className="p-0">
                <Button
                  variant={activeTab === TabState.STATS ? `default` : `ghost`}
                  className={`${
                    activeTab === TabState.STATS ? "" : "border"
                  } w-full p-4`}
                >
                  Stats
                </Button>
              </TabsTrigger>
            ) : null}
            {isClientReadAllowed && (
              <TabsTrigger value={TabState.CLIENTS} className="p-0">
                <Button
                  variant={activeTab === TabState.CLIENTS ? `default` : `ghost`}
                  className={`${
                    activeTab === TabState.CLIENTS ? "" : "border"
                  } w-full p-4` }
                >
                  Clients
                </Button>
              </TabsTrigger>
            )}
          </TabsList>
        )}
        <TabsContent value={TabState.RECENT_CALLS}>
          <>
            <div className="h-full flex-1 flex-col p-0 flex">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  {/* For desktop view */}
                  {!isMobile && (
                    <div className="mt-4">
                      <Stats dateRange={dateRange} stats={stats} />
                    </div>
                  )}
                  <AccordionTrigger
                    showIcon={false}
                    className="flex justify-end mr-2"
                  >
                    <div className="flex items-center justify-end mb-2">
                      <div className="">
                        {/* Clear Filter Button */}
                        {showClearFilterButton && (
                          <Badge
                            variant="outline"
                            className=" border-[#f97316] group hover:bg-[#f97316] hover:text-white text-[#f97316]"
                            onClick={handleClearFilters}
                          >
                            <span className="whitespace-nowrap ">
                              clear filters
                            </span>
                            <div className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                              <X className="h-3 w-3 text-[#f97316] group-hover:text-white" />
                            </div>
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-transparent"
                          onClick={(e) => {
                            e.preventDefault();
                            loadCallLogs();
                          }}
                        >
                          <RefreshCcw className="h-5 w-5 text-gray-900"/>
                          <span className="sr-only">Refresh</span>
                        </Button>
                      </div>
                      {(isUsersFilterAllowed ||
                        isSearchFilterAllowed ||
                        isDateFilterAllowed ||
                        isStatusFilterAllowed ||
                        isTagsFilterAllowed ||
                        isBranchFilterAllowed) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className={`size-6`}
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                          />
                        </svg>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="py-4">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pl-0.5 md:justify-between md:items-center">
                      {/* Call status filter */}
                      <Filters
                        searchText={searchText}
                        setSearchText={setSearchText}
                        selectedCallFilter={selectedCallFilter}
                        handleFilterChange={handleFilterChange}
                        dateRange={dateRange}
                        handleRangeChange={handleRangeChange}
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        showTags={false}
                        comboboxBranches={comboboxBranches}
                        selectedBranches={selectedBranches}
                        setSelectedBranches={setSelectedBranches}
                        setBranchSearchText={setSearchedBranch}
                        showDateRange
                      />

                      {isUsersFilterAllowed && (
                        <div className="">
                          <Combobox
                            data={mappedAgents}
                            label="users"
                            setValue={setSelectedAgent}
                            getValues={() => selectedAgent}
                            setSearchText={setSearchedAgent}
                          />
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Call records table */}
            <div className="">
              <div className="flex items-center justify-center">
                <DataTable
                  tableId={"Dashbord_Page"}
                  data={calls}
                  columns={isMobile ? mobileColumns : columns}
                  totalRecords={totalRecords?.TotalRecord ?? 0}
                  page={page}
                  recordsPerPage={recordsPerPage}
                  isLoading={isLoading}
                  handlePageChange={handlePageChange}
                  setRecordsPerPage={setRecordsPerPage}
                  contextMenuItems={contextMenuItems}
                />
              </div>
            </div>
          </>
        </TabsContent>

        {isClientReadAllowed && (
          <TabsContent value={TabState.CLIENTS}>
            <ClientMaster />
          </TabsContent>
        )}

        {/* For mobile view */}
        {isMobile && (
          <TabsContent value={TabState.STATS}>
            <Stats dateRange={dateRange} stats={stats} />
          </TabsContent>
        )}

        {isUserReadAllowed && !isMobile && (
          <TabsContent value={TabState.USERS}>
            <UserMaster />
          </TabsContent>
        )}
      </Tabs>

      <RecordingModal />
      <EditCallerInfoDialog loadCallLogs={loadCallLogs} />
      <FollowupDetails />
    </div>
  );
}
