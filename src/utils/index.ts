import { getDayRangeEpoch } from "@/lib/utils";
import apiClient from "./apiClient";
import {
  getCallStatus,
  CONNECT_STATUS,
  RegisterStatus,
  CallSessionDirection,
  CallStatusState,
} from "./callStatus";
import {
  VTS_LOCAL_STORAGE_AGENT_DATA_KEY,
  VTS_LOCAL_STORAGE_PREFERRED_INPUT_DEVICE,
  VTS_LOCAL_STORAGE_PREFERRED_OUTPUT_DEVICE,
  VTS_LOCAL_STORAGE_TOKEN_KEY,
  VTS_SOCKET_LOGOUT_CHANNEL,
} from "./constants";
import {
  convertDateTime,
  formatDuration,
  convertCallDurationSeconds,
} from "./dateHelpers";

export {
  getCallStatus,
  CONNECT_STATUS,
  RegisterStatus,
  CallSessionDirection,
  CallStatusState,
  apiClient,
  convertDateTime,
  formatDuration,
  convertCallDurationSeconds,
  getDayRangeEpoch,
  VTS_LOCAL_STORAGE_AGENT_DATA_KEY,
  VTS_LOCAL_STORAGE_PREFERRED_INPUT_DEVICE,
  VTS_LOCAL_STORAGE_PREFERRED_OUTPUT_DEVICE,
  VTS_LOCAL_STORAGE_TOKEN_KEY,
  VTS_SOCKET_LOGOUT_CHANNEL,
};
