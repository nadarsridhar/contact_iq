export enum CallStatusState {
  INCOMING = 1,
  ANSWERED = 2,
  UNANSWERED = 4,
  HANGUP = 8,
  UNREGISTERED = 16,
}

export enum CallType {
  INCOMING = 1,
  OUTGOING = 2,
}

export enum CallSessionDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export enum RegisterStatus {
  UNREGISTERED = "UNREGISTERED",
  REGISTERED = "REGISTERED",
}

export enum CONNECT_STATUS {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export function getCallStatus(state: CallStatusState, callType: number) {
  switch (Number(state)) {
    case CallStatusState.INCOMING: {
      return {
        statusText:
          callType == CallStatusState.INCOMING ? "Incoming" : "Outgoing",
        bgColor: "bg-yellow-100 text-yellow-800",
        textColor: "text-yellow-800",
        border: "border border-green-400",
      };
    }

    case CallStatusState.ANSWERED:
      return {
        statusText: "In Call",
        bgColor: "bg-green-100 text-green-800",
        textColor: "text-green-800",
        border: "border border-green-200",
      };

    case CallStatusState.UNANSWERED:
      return {
        statusText: callType == CallType.INCOMING ? "Missed" : "Unanswered",
        bgColor: "bg-red-100 text-red-800",
        textColor: "text-red-800",
        border: "border border-red-200",
      };

    case CallStatusState.HANGUP:
      return {
        statusText: "Completed",
        bgColor: "bg-green-100 text-green-800",
        textColor: "text-green-800",
        border: "border border-green-200",
      };

    case CallStatusState.UNREGISTERED:
      return {
        statusText: "Unregistered",
        bgColor: "bg-gray-200 text-gray-950",
        textColor: "text-gray-900",
        border: "border border-gray-300",
      };

    default:
      return {
        statusText: "",
        bgColor: "",
        textColor: "",
      };
  }
}
