import { createContext, useContext } from "react";
import { CALL_TYPE, useAuth } from "./AuthContext";
import {
  CallQueuePrivilege,
  CRUDPrivilege,
  ExportImportPrivilege,
  FiltersPrivilege,
  hasPrivilege,
  NumberVisibilityPrivilege,
  PasswordPrivilege,
  PushNotificationPrivilege,
  RecordingPrivilege,
  RemarksPrivilege,
  ReportsPrivilege,
  SetPrivilege,
  StatisticsPrivilege,
  TaskPrivilege,
  TemplateMappingPrivilege,
  WebRTCPrivilege,
} from "@/utils/privileges";
import dashboardIcon from "../../public/SVGs/dashboard.svg";
import clientsIcon from "../../public/SVGs/clients.svg";
import templateMapIcon from "../../public/SVGs/templateMap.svg";
import reportsIcon from "../../public/SVGs/reports.svg";
import masterIcon from "../../public/SVGs/master.svg";
import privilegesIcon from "../../public/SVGs/privileges.svg";
import calendarClockIcon from "../../public/SVGs/calendarclock.svg";
import settingsIcon from "../../public/SVGs/SettingIcon.svg";

const PrivilegeContext = createContext(null);

export const PrivilegeProvider = ({ children }) => {
  const { privileges = {}, isSuperAdmin, isBranchAdmin, agent } = useAuth();
  if (!privileges) return children;

  let {
    branch = 0,
    callQue = 0,
    clients = 0,
    expImp = 0,
    filters = 0,
    numVis = 0,
    pass = 0,
    priv = 0,
    pushNot = 0,
    rec = 0,
    remarks = 0,
    reports = 0,
    stats = 0,
    tempMap = 0,
    users = 0,
    webrtc = 0,
    settings = 0,
    task = 0,
  } = privileges?.PrivilegeInfo;

  // Push notification privilege
  const isPushNotificationAllowed = hasPrivilege(
    pushNot,
    PushNotificationPrivilege.ENABLE
  );

  // Phone number privilege
  const isPhoneNumberAllowed = hasPrivilege(
    numVis,
    NumberVisibilityPrivilege.ENABLE
  );

  // Call Queue privilege
  const isCallQueueAllowed = hasPrivilege(callQue, CallQueuePrivilege.ENABLE);

  // Branch CRUD privilege
  const isBranchReadAllowed = hasPrivilege(branch, CRUDPrivilege.READ);
  const isBranchCreateAllowed = hasPrivilege(branch, CRUDPrivilege.CREATE);
  const isBranchUpdateAllowed = hasPrivilege(branch, CRUDPrivilege.UPDATE);
  // const isBranchDeleteAllowed = hasPrivilege(branch, CRUDPrivilege.DELETE);
  const isBranchDeleteAllowed = false;

  // Client CRUD privilege
  const isClientReadAllowed = hasPrivilege(clients, CRUDPrivilege.READ);
  const isClientCreateAllowed = hasPrivilege(clients, CRUDPrivilege.CREATE);
  const isClientUpdateAllowed = hasPrivilege(clients, CRUDPrivilege.UPDATE);
  const isClientDeleteAllowed = hasPrivilege(clients, CRUDPrivilege.DELETE);

  // USER CRUD privilege
  const isUserReadAllowed = hasPrivilege(users, CRUDPrivilege.READ);
  const isUserCreateAllowed = hasPrivilege(users, CRUDPrivilege.CREATE);
  const isUserUpdateAllowed = hasPrivilege(users, CRUDPrivilege.UPDATE);
  const isUserDeleteAllowed = hasPrivilege(users, CRUDPrivilege.DELETE);

  // Webrtc Privilege
  const isWebrtcAllowed =
    hasPrivilege(webrtc, WebRTCPrivilege.ENABLED) &&
    agent?.WebRTCFlag & CALL_TYPE.WEBRTC;
  const isClickToCallAllowed = hasPrivilege(
    webrtc,
    WebRTCPrivilege.CLICK_TO_CALL
  );
  const isAMICallAllowed = agent?.WebRTCFlag & CALL_TYPE.AMI_CALL;
  const isDialpadAllowed = hasPrivilege(webrtc, WebRTCPrivilege.DIALPAD);
  const isBarginAllowed =
    hasPrivilege(webrtc, WebRTCPrivilege.BARGIN) && isWebrtcAllowed;

  const isViewRecordingAllowed = hasPrivilege(rec, RecordingPrivilege.PLAY);
  const isRecordingDownloadAllowed = hasPrivilege(
    rec,
    RecordingPrivilege.DOWNLOAD
  );

  // Reports privilege
  const isCallTrafficReportAllowed = hasPrivilege(
    reports,
    ReportsPrivilege.CALL_TRAFFIC
  );
  const isUserActivityReportAllowed = hasPrivilege(
    reports,
    ReportsPrivilege.USER_ACTIVITY
  );
  const isTradeExceptionReportAllowed = hasPrivilege(
    reports,
    ReportsPrivilege.TRADE_EXCEPTION
  );

  // Export/Import privilege
  const isUserExportImportAllowed =
    hasPrivilege(expImp, ExportImportPrivilege.USER) && isUserReadAllowed;
  const isClientExportImportAllowed =
    hasPrivilege(expImp, ExportImportPrivilege.CLIENT) && isClientReadAllowed;
  const isRecordingExportImportAllowed = hasPrivilege(
    expImp,
    ExportImportPrivilege.RECORDINGS
  );
  const isCallTrafficExportAllowed =
    hasPrivilege(expImp, ExportImportPrivilege.CALL_TRAFFIC) &&
    isCallTrafficReportAllowed;
  const isUserActivityReportExportAllowed =
    hasPrivilege(expImp, ExportImportPrivilege.USER_ACTIVITY) &&
    isUserActivityReportAllowed;
  const isCallsExportImportAllowed = hasPrivilege(
    expImp,
    ExportImportPrivilege.CALLS
  );
  const isTradeExceptionExportImportAllowed = hasPrivilege(
    expImp,
    ExportImportPrivilege.TRADE_EXCEPTION
  );

  // Stats privilege
  const isCallStatsAllowed = hasPrivilege(stats, StatisticsPrivilege.DEFAULT);
  const isChannelStatsAllowed = hasPrivilege(
    stats,
    StatisticsPrivilege.CHANNELS
  );

  // Call record update privilege
  const isUpdateCallDetailsAllowed = hasPrivilege(
    remarks,
    RemarksPrivilege.ENABLE
  );

  // Password privilege
  const isChangePassordAllowed = hasPrivilege(
    pass,
    PasswordPrivilege.CHANGE_PASSWORD
  );
  const isResetPassordAllowed = hasPrivilege(
    pass,
    PasswordPrivilege.RESET_PASSWORD
  );

  // Filters privilege
  const isSearchFilterAllowed = hasPrivilege(filters, FiltersPrivilege.SEARCH);
  const isDateFilterAllowed = hasPrivilege(filters, FiltersPrivilege.DATE);
  const isStatusFilterAllowed = hasPrivilege(filters, FiltersPrivilege.STATUS);
  const isTagsFilterAllowed = hasPrivilege(filters, FiltersPrivilege.TAGS);
  const isBranchFilterAllowed = hasPrivilege(filters, FiltersPrivilege.BRANCH);
  const isUsersFilterAllowed = hasPrivilege(filters, FiltersPrivilege.USERS);
  const isDatePickerFilterAllowed = hasPrivilege(
    filters,
    FiltersPrivilege.DATE_PICKER
  );

  // Template mapping privilege
  const isTemplateMappingAllowed = hasPrivilege(
    tempMap,
    TemplateMappingPrivilege.ENABLE
  );

  const isSetPrivilegeAllowed = hasPrivilege(priv, SetPrivilege.ENABLE);

  const isFollowupTaskAllowed = hasPrivilege(task, TaskPrivilege.FOLLOW_UP);
  const isGlobalSettingsReadAllowed = hasPrivilege(
    settings,
    SetPrivilege.ENABLE
  );

  const NAV_LINKS = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: dashboardIcon,
      items: [],
      hasPrivilege: true,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: clientsIcon,
      items: [],
      hasPrivilege: isClientReadAllowed && !(isSuperAdmin || isBranchAdmin),
    },
    {
      title: "Followups",
      url: "/followups",
      icon: calendarClockIcon,
      items: [],
      hasPrivilege: isFollowupTaskAllowed && !(isSuperAdmin || isBranchAdmin),
    },
    {
      title: "Users",
      url: "/users",
      icon: clientsIcon,
      items: [],
      hasPrivilege: isUserReadAllowed && !(isSuperAdmin || isBranchAdmin),
    },

    {
      title: "Master",
      url: "",
      icon: masterIcon,
      hasPrivilege:
        (isBranchReadAllowed || isUserReadAllowed || isClientReadAllowed) &&
        (isBranchCreateAllowed || isUserCreateAllowed || isClientCreateAllowed),
      items: [
        {
          title: "Branches",
          url: "/admin/branch",
          hasPrivilege: isBranchReadAllowed,
        },
        {
          title: "Users",
          url: "/users",
          hasPrivilege: isUserReadAllowed,
        },
        {
          title: "Clients",
          url: "/clients",
          hasPrivilege: isClientReadAllowed,
        },
      ],
    },
    {
      title: "Reports",
      url: "",
      icon: reportsIcon,
      hasPrivilege: isCallTrafficReportAllowed,
      items: [
        {
          title: "Call Traffic",
          url: "/admin/reports/call-traffic",
          hasPrivilege: isCallTrafficReportAllowed,
        },
        {
          title: "User Activity",
          url: "/admin/reports/user-activity",
          hasPrivilege: isUserActivityReportAllowed,
        },
        {
          title: "Trade Exception",
          url: "/admin/reports/trade-exception",
          hasPrivilege: isTradeExceptionReportAllowed,
        },
      ],
    },
    {
      title: "Template Mapping",
      url: "/admin/template-mapping",
      icon: templateMapIcon,
      items: [],
      hasPrivilege: isTemplateMappingAllowed,
    },
    {
      title: "Privileges",
      url: "/privileges",
      icon: privilegesIcon,
      items: [],
      hasPrivilege: isSetPrivilegeAllowed,
    },
    {
      title: "Global Settings",
      url: "/admin/settings",
      icon: settingsIcon,
      items: [],
      hasPrivilege: isGlobalSettingsReadAllowed,
    },
    {
      title: "Followups",
      url: "/followups",
      icon: calendarClockIcon,
      items: [],
      hasPrivilege: isFollowupTaskAllowed && (isSuperAdmin || isBranchAdmin),
    },
  ];

  const allowedLinks = NAV_LINKS.filter((el) => {
    if (el?.items?.length > 0) {
      const temp = el.items.filter((el) => el.hasPrivilege);
      el.items = temp;
    }
    return el.hasPrivilege;
  });

  const value = {
    isPushNotificationAllowed,
    isPhoneNumberAllowed,
    isCallQueueAllowed,
    isBranchReadAllowed,
    isBranchCreateAllowed,
    isBranchUpdateAllowed,
    isBranchDeleteAllowed,
    isClientReadAllowed,
    isClientCreateAllowed,
    isClientUpdateAllowed,
    isClientDeleteAllowed,
    isUserReadAllowed,
    isUserCreateAllowed,
    isUserUpdateAllowed,
    isUserDeleteAllowed,
    isWebrtcAllowed,
    isAMICallAllowed,
    isClickToCallAllowed,
    isDialpadAllowed,
    isBarginAllowed,
    isViewRecordingAllowed,
    isRecordingDownloadAllowed,
    isUserExportImportAllowed,
    isClientExportImportAllowed,
    isRecordingExportImportAllowed,
    isCallTrafficExportAllowed,
    isCallsExportImportAllowed,
    isCallStatsAllowed,
    isChannelStatsAllowed,
    isUpdateCallDetailsAllowed,
    isCallTrafficReportAllowed,
    isChangePassordAllowed,
    isResetPassordAllowed,
    isSearchFilterAllowed,
    isDateFilterAllowed,
    isStatusFilterAllowed,
    isTagsFilterAllowed,
    isBranchFilterAllowed,
    isUsersFilterAllowed,
    isTemplateMappingAllowed,
    isSetPrivilegeAllowed,
    allowedLinks,
    isUserActivityReportAllowed,
    isUserActivityReportExportAllowed,
    isFollowupTaskAllowed,
    isTradeExceptionReportAllowed,
    isDatePickerFilterAllowed,
    isTradeExceptionExportImportAllowed,
    isGlobalSettingsReadAllowed,
  };

  return (
    <PrivilegeContext.Provider value={value}>
      <img src="" alt="" />
      {children}
    </PrivilegeContext.Provider>
  );
};

export const usePrivilege = () => {
  const context = useContext(PrivilegeContext);
  if (!context) {
    throw new Error("usePrivilege must be used within an PrivilegeContext");
  }
  return context;
};
