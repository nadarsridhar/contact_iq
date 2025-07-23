import { CallStatusState, CallType } from "./callStatus";
import { ICallFilter, IReportType, ITagFilter } from "./interfaces";

export const CALL_CATEGORY_FILTER: ICallFilter[] = [
  {
    key: "All",
    value: { CallStatus: -1, CallType: -1 },
  },
  {
    key: "Incoming",
    value: { CallStatus: -1, CallType: CallType.INCOMING },
  },
  {
    key: "Outgoing",
    value: { CallStatus: -1, CallType: CallType.OUTGOING },
  },
  {
    key: "In Call",
    value: {
      CallStatus: CallStatusState.INCOMING + CallStatusState.ANSWERED,
      CallType: 3,
    },
  },
  {
    key: "Unanswered",
    value: {
      CallStatus: CallStatusState.UNANSWERED,
      CallType: CallType.OUTGOING,
    },
  },
  {
    key: "Missed",
    value: {
      CallStatus: CallStatusState.UNANSWERED,
      CallType: CallType.INCOMING,
    },
  },
  {
    key: "Completed",
    value: { CallStatus: CallStatusState.HANGUP, CallType: -1 },
  },
  {
    key: "Unregistered",
    value: { CallStatus: CallStatusState.UNREGISTERED, CallType: -1 },
  },
];

export const TAG_FILTER: ITagFilter[] = [
  {
    key: "Untagged",
    value: -1,
  },
  {
    key: "Price Enquiry",
    value: 1,
  },
  {
    key: "Buy",
    value: 2,
  },
  {
    key: "Sell",
    value: 4,
  },
  {
    key: "Multi-Trade",
    value: 8,
  },
  {
    key: "AL",
    value: 16,
  },
];

export const USER_CATEGORY_FILTER: ITagFilter[] = [
  {
    key: "All",
    value: -1,
  },
  {
    key: "Super Admin",
    value: 1,
  },
  {
    key: "Agent",
    value: 2,
  },
  {
    key: "Branch Admin",
    value: 4,
  },
  {
    key: "Team Manager",
    value: 8,
  },
];

export const TRADE_EXCEPTION_REPORT_TYPE: IReportType[] = [
  {
    key: "Exception",
    value: 1,
  },
  {
    key: "Match",
    value: 2,
  },
];
