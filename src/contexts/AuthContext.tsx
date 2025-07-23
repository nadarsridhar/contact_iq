import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import {
  useLocalStorageState,
  useLocalStorageStateWithEncryption,
} from "@/hooks";
import { logoutApi } from "@/services/apiAuth";
import { VTS_LOCAL_STORAGE_TOKEN_KEY } from "@/utils";
import {
  VTS_LOCAL_STORAGE_AGENT_DATA_KEY,
  VTS_LOCAL_STORAGE_LAST_SAVED_CREDENTIALS,
  VTS_LOCAL_STORAGE_PRIVILEGE_KEY,
  VTS_LOCAL_STORAGE_RECORDS_PER_PAGE,
  VTS_SOCKET_ADMIN_CALL_CHANNEL,
  VTS_SOCKET_AGENT_CALL_CHANNEL,
  VTS_SOCKET_FOLLOW_UP_CHANNEL,
} from "@/utils/constants";
import { UserCategory } from "@/utils/userCategory";
import { getLoggedInUsersApi } from "@/services/apiUser";
import { useNavigate } from "react-router-dom";
import useSocketPolling from "@/hooks/useSocketPolling";

const AuthContext = createContext(null);

export interface IUserDetails {
  ActiveFlag: number;
  BranchId: number;
  BranchName: string;
  CallMode: number;
  CompanyName: string;
  IsDeleted: number;
  LoginMode: number;
  MappingTemplateId: string;
  Password: string;
  Pin: number;
  PrivilegeTemplateId: string;
  UpdatedBy: string;
  UserAlternateMobileNumber: string;
  UserEmailId: string;
  UserId: string;
  UserMobileNumber: string;
  UserName: string;
  UserStatus: number;
  UserCategory: UserCategory;
  WebRTCFlag: number;
  WorkingHoursTemplateId: string;
  SessionId: string;
  LastUpdateDate: number;
  LoggedInAddress: string;
  LoggedInApp: string;
  LoggedInTime: number;
  LoggedOutTime: number;
  Origin: number;
}

export enum CALL_TYPE {
  WEBRTC = 1,
  AMI_CALL = 2,
}

interface IFeatureFlag {
  AutoCall: boolean;
}

export const AuthProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentCallData, setCurrentCallData] = useState({});

  const [isTabActive, setIsTabActive] = useState(document.hasFocus());
  const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  const navigate = useNavigate();

  const [token, setToken] = useLocalStorageStateWithEncryption<string | null>(
    null,
    VTS_LOCAL_STORAGE_TOKEN_KEY
  );
  const { socketRef, isWebSocketConnected, handleSocketConnect } =
    useSocketPolling({ isAuthenticated, token });
  const [agent, setAgent] =
    useLocalStorageStateWithEncryption<IUserDetails | null>(
      null,
      VTS_LOCAL_STORAGE_AGENT_DATA_KEY
    );

  const [lastSavedCredentials, setLastSavedCredentials] =
    useLocalStorageStateWithEncryption(
      null,
      VTS_LOCAL_STORAGE_LAST_SAVED_CREDENTIALS
    );
  const [privileges, setPrivileges] = useLocalStorageStateWithEncryption(
    null,
    VTS_LOCAL_STORAGE_PRIVILEGE_KEY
  );
  const [recordsPerPage, setRecordsPerPage] = useLocalStorageState(
    40,
    VTS_LOCAL_STORAGE_RECORDS_PER_PAGE
  );
  const [featureFlags, setFeatureFlags] = useState<IFeatureFlag>({
    AutoCallFeature: false,
  });

  const login = ({ accessToken = "", userData = {} }, metaData = {}) => {
    if (Object.entries(userData).length === 0) return;
    setFeatureFlags(metaData?.Features);
    // Store auth token and logged in agent details in memory
    setToken(accessToken);
    if (userData?.PWExpireTime) {
      setAgent({ ...userData.UserInfo, PWExpireTime: userData.PWExpireTime });
    } else {
      setAgent(userData.UserInfo);
    }
    setPrivileges(userData.PrivilegeInfo);
    setIsAuthenticated(true);

    // Connect websocket
    handleSocketConnect(accessToken);
  };

  const logout = async (callApi = true) => {
    try {
      // Clear agent and token from memory and local storage
      setToken(null);
      setAgent(null);
      setPrivileges(null);
      setIsAuthenticated(false);
      localStorage.removeItem(VTS_LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(VTS_LOCAL_STORAGE_AGENT_DATA_KEY);
      localStorage.removeItem(VTS_LOCAL_STORAGE_PRIVILEGE_KEY);

      // Call logout API
      if (callApi) await logoutApi({ UserId: agent?.UserId });
    } catch (error) {
    } finally {
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    async function fetchLoggedInUserData() {
      // Fill LoginId from JWT in the backend
      const { Data: data, MetaData: metaData } = await getLoggedInUsersApi({
        LoginId: "",
      });
      login({ userData: data }, metaData);
      navigate(`/dashboard`);
    }
    fetchLoggedInUserData();
  }, []);

  const hasSuperAdminPrivilege =
    agent?.UserCategory === UserCategory.SUPER_ADMIN;
  const isSuperAdmin = agent?.UserCategory === UserCategory.SUPER_ADMIN;
  const isBranchAdmin = agent?.UserCategory === UserCategory.BRANCH_ADMIN;
  const isTeamManager = agent?.UserCategory === UserCategory.TEAM_MANAGER;
  const isAgent = agent?.UserCategory === UserCategory.Agent;

  // TODO: Enable according to privilege
  useEffect(() => {
    if (!isWebSocketConnected || isBranchAdmin || isSuperAdmin) return;
    const socketChannel =
      isBranchAdmin || isSuperAdmin
        ? VTS_SOCKET_ADMIN_CALL_CHANNEL
        : VTS_SOCKET_AGENT_CALL_CHANNEL;

    socketRef.current.on(socketChannel, async (data) => {
      console.log("Global call records socket data received: ", data.message);
      setCurrentCallData(data.message);
    });

    return () => socketRef.current.off(socketChannel);
  }, [socketRef.current, isWebSocketConnected, isBranchAdmin, isSuperAdmin]);

  const [DynamicWidth, setDynamicWidth] = useState(0);

  useEffect(() => {
    function getWindowWidth() {
      const width = window.innerWidth;
      const numberOfLetters =
        width < 300
          ? 10
          : width < 400
          ? 20
          : width < 500
          ? 30
          : width < 600
          ? 40
          : width < 700
          ? 50
          : width < 900
          ? 70
          : width < 1200
          ? 90
          : 200;
      setDynamicWidth(numberOfLetters);
    }

    getWindowWidth();
    window.addEventListener("resize", getWindowWidth);

    return () => {
      window.removeEventListener("resize", getWindowWidth);
    };
  }, []);

  const value = {
    DynamicWidth,
    isLoginAlertOpen,
    setIsLoginAlertOpen,
    currentCallData,
    isAuthenticated,
    login,
    logout,
    token,
    setToken,
    agent,
    isWebSocketConnected,
    setActiveCall,
    activeCall,
    handleSocketConnect,
    socket: socketRef.current,
    hasSuperAdminPrivilege,
    isSuperAdmin,
    isBranchAdmin,
    isAgent,
    isTeamManager,
    privileges,
    recordsPerPage,
    setRecordsPerPage,
    isTabActive,
    isWindowFocused,
    featureFlags,
    setLastSavedCredentials,
    lastSavedCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
