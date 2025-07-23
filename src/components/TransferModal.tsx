import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Combobox } from "./ui/combobox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCategory } from "@/utils/userCategory";
import {
  IGetBranchRequestPayload,
  IGetUserRequestPayload,
} from "@/utils/interfaces";
import { getBranchesApi } from "@/services/apiBranches";
import { getUsersApi } from "@/services/apiUser";
import { useAuth } from "@/contexts/AuthContext";
import { transferSchema } from "@/schemas/transfer";
import { useTransferModal } from "@/hooks/useTransferModal";
import { z } from "zod";
import { useSessionCall, useSIPProvider } from "./SipProvider";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { transferCallApi } from "@/services/apiCalls";
import { toast } from "sonner";

function TransferModal() {
  const { isOpen, onClose: closeTransferModel } = useTransferModal();
  const { agent, activeCall, currentCallData } = useAuth();

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchedBranch, setSearchedBranch] = useState("");
  const [searchedAgent, setSearchedAgent] = useState("");

  const comboboxBranchIds = branches.map(({ BranchName }) => ({
    label: BranchName,
    value: BranchName,
  }));
  const comboboxUserIds = users.map(({ UserId }) => ({
    label: UserId,
    value: UserId,
  }));

  async function fetchBranchList(payload: IGetBranchRequestPayload) {
    const { Data: data, MetaData: metaData } = await getBranchesApi(payload);
    setBranches(data);
  }

  async function fetchUserList(payload: IGetUserRequestPayload) {
    const { Data: data, MetaData: metaData } = await getUsersApi(payload);
    setUsers(data);
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
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedBranch]);

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      BranchName: "",
      Agent: "",
    },
  });

  const selectedBranch = form.watch("BranchName");

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((searchedAgent && searchedAgent.length > 2) || !searchedAgent) {
        const payload = {
          BranchName: "",
          LoginId: agent.UserId,
          UserCategory: UserCategory.Agent,
          StartIndex: 0,
          RecordsPerPage: 5,
          UserId: searchedAgent,
          SearchText: "",
        };
        fetchUserList(payload);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedAgent]);

  useEffect(() => {
    return () => form.reset();
  }, []);

  const onSubmit = () => {};

  const handleTransferCall = async () => {
    if (!window.APP_CONFIG.CALL_TRANSFER) return;
    try {
      const {
        ClientId,
        ClientName,
        ClientNumber,
        DealerChannel,
        UniqueCallIdentifier,
      } = currentCallData;

      const targetAgent =
        users?.find((user) => user?.UserId === form.watch("Agent")) || {};
      const payload = {
        AgentNumber: agent.UserMobileNumber,
        AgentId: agent.UserId,
        ClientName,
        ClientId,
        ClientNumber,
        TargetAgentNumber: targetAgent?.UserMobileNumber,
        AgentChannel: DealerChannel,
        UniqueCallIdentifier,
      };
      await transferCallApi(payload);
      closeTransferModel();
      toast.success(`Call transfer initiated`);
    } catch (error) {
      toast.error(`Error while initiating call transfer`);
    } finally {
    }
  };

  const onBranchChange = (val) => {
    form.setValue("BranchName", val);
    form.setValue("Agent", "");
  };

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onClose={closeTransferModel}
      title={"Transfer Call"}
    >
      <div className="flex flex-col justify-between">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-1 mb-6">
              <FormField
                control={form.control}
                name="Agent"
                render={({ field }) => {
                  return (
                    <FormItem>
                      {/* <FormLabel>Agent</FormLabel> */}
                      <FormControl className="flex">
                        <>
                          <Combobox
                            data={comboboxUserIds}
                            label="agent"
                            setValue={form.setValue}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedAgent}
                            {...field}
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <Button
              onClick={handleTransferCall}
              type="submit"
              className="w-full"
              disabled={!Boolean(form.watch("Agent"))}
            >
              Transfer
            </Button>
          </form>
        </Form>
      </div>
    </Modal>
  );
}

export default TransferModal;
