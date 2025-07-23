import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import FollowupForm from "./FollowupForm";
import {
  useCreateFollowup,
  useFollowUpModalStore,
} from "@/hooks/useCreateFollowup";
import { Button } from "../ui/button";
import { updateFollowupApi } from "@/services/apiFollowup";
import { TaskStatus } from "@/utils/followup";
import { ACTIONS } from "@/utils/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useSIPProvider } from "../SipProvider";
import { makeCallApi } from "@/services/apiCalls";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export function CreateFollowupDialog() {
  const [title, setTitle] = useState("");
  const { isOpen, onClose, data, setData } = useCreateFollowup();

  useEffect(() => {
    switch (data.OperationCode) {
      case ACTIONS.CREATE:
        setTitle(`Create`);
        break;

      case ACTIONS.UPDATE:
        setTitle(`Update`);
        break;

      case ACTIONS.DELETE:
        setTitle(`Cancel`);
        break;
    }
  }, [data]);

  return (
    <Dialog open={isOpen} modal defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded w-4/5 md:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl mb-2 font-bold text-primary">
            {title} followup
          </DialogTitle>
        </DialogHeader>
        <FollowupForm />
        <DialogFooter>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FollowUpModalRenderer() {
  const modals = useFollowUpModalStore((state) => state.modals);
  const closeModal = useFollowUpModalStore((state) => state.closeModal);
  const { agent, setActiveCall } = useAuth();
  const { isAMICallAllowed, isWebrtcAllowed } = usePrivilege();
  const { sessionManager } = useSIPProvider();
  const { setData: setCreateFollowupData, setTriggerApiRefresh } =
    useCreateFollowup();

  async function updateFollowup(followupData) {
    try {
      const payload = {
        ...followupData,
        AttendedId: agent.UserId,
        AttendedName: agent.UserName,
        OperationCode: ACTIONS.UPDATE,
        Status: TaskStatus.Completed,
      };
      await updateFollowupApi(payload);
      setTriggerApiRefresh();
      toast.success(`Follow up updated successfully`);
    } catch (error) {
      console.log(error);
      toast.error(typeof error === "string" ? error : error?.message);
    }
  }

  const handleCall = async (callPayload) => {
    try {
      setActiveCall(callPayload);
      const SIP_URL = window.APP_CONFIG.SIP_HOST;
      let {
        ClientId,
        ClientName,
        ClientNumber = "",
        IsDialpadCall,
      } = callPayload;

      // AMI call
      if (isAMICallAllowed) {
        const payload = {
          AgentNumber: agent.UserMobileNumber,
          AgentId: agent.UserId,
          ClientName,
          ClientId,
          ClientNumber,
          IsDialpadCall,
        };
        const response = await makeCallApi(payload);
        if (response && response.status !== "success") {
          toast.error(JSON.parse(response.response.data).error);
          throw new Error(JSON.parse(response.response.data).error);
        }
        toast.success("Connecting call..");
      }
      // Webrtc call
      else {
        const customHeaders = [
          `DI: ${agent.UserId}`,
          `DN: ${agent.UserMobileNumber}`,
          `CN: ${ClientNumber}`,
          `CI: ${ClientId}`,
          `CNM: ${ClientName}`,
          `IS_DIALPAD_CALL: ${IsDialpadCall}`,
        ];

        let sipUri = `sip:${agent.UserMobileNumber}@${SIP_URL}`;

        const inviterOptions = { extraHeaders: customHeaders };
        await sessionManager?.call(sipUri, inviterOptions);

        if (window?.flutter_inappwebview) {
          window.flutter_inappwebview.callHandler(
            "OutgoingCall",
            ClientId,
            ClientName
          );
        }
      }
    } catch (error) {
      console.log(error.message);
      if (error.message === "Permission denied") {
        toast.error(`Kindly enable microphone permissions`);
        return;
      }
      console.error("Failed while initiating call", error);
    }
  };

  return (
    <>
      {Object.entries(modals).map(([id, { open, data }]) => {
        const { CallInfo: callInfo, TaskInfo: taskInfo } = data;

        // TODO: Don't allow closing of popup on escape, only on button event
        return (
          <Dialog open={open} modal onOpenChange={(o) => !o && closeModal(id)}>
            <DialogContent className="rounded w-4/5 md:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl mb-2 font-bold text-primary">
                  Follow up call
                </DialogTitle>
              </DialogHeader>
              <div>
                <p className="text-xl font-semibold">
                  This call is scheduled for {taskInfo?.ClientId} about{" "}
                  {taskInfo?.Title}
                </p>
                <p>{taskInfo?.Description}</p>
                <div className="flex justify-end gap-2">
                  {(isWebrtcAllowed || isAMICallAllowed) && (
                    <Button
                      onClick={async () => {
                        await updateFollowup(taskInfo);
                        await handleCall(callInfo);
                        closeModal(id);
                      }}
                      variant="success"
                    >
                      Call Now
                    </Button>
                  )}
                  <Button
                    onClick={async () => {
                      await updateFollowup(taskInfo);
                      closeModal(id);
                      setCreateFollowupData({});
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <DialogClose />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}
