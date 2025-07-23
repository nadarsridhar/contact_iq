import { useEffect, useState } from "react";
import Modal from './ui/Modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Combobox } from './ui/combobox';
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useConferenceModal } from "@/hooks/useConferenceModal";
import { UserCategory } from "@/utils/userCategory";
import { IGetUserRequestPayload } from "@/utils/interfaces";
import { getUsersApi } from "@/services/apiUser";
import { useSessionCall, useSIPProvider } from "./SipProvider";
import { toast } from "sonner";
import { Users } from "lucide-react";

const conferenceSchema = z.object({
  Agent: z.string().min(1, "Please select an agent"),
});

function ConferenceModal() {
  const { isOpen, onClose: closeConferenceModal } = useConferenceModal();
  const { agent, activeCall } = useAuth();
  const { sessionManager } = useSIPProvider();

  const [users, setUsers] = useState([]);
  const [searchedAgent, setSearchedAgent] = useState("");

  const comboboxUserIds = users.map(({ UserId }) => ({
    label: UserId,
    value: UserId,
  }));

  async function fetchUserList(payload: IGetUserRequestPayload) {
    const { Data: data, MetaData: metaData } = await getUsersApi(payload);
    setUsers(data);
  }

  const form = useForm<z.infer<typeof conferenceSchema>>({
    resolver: zodResolver(conferenceSchema),
    defaultValues: {
      Agent: "",
    },
  });

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

  const handleAddToConference = async () => {
    try {
      const targetAgent = users?.find((user) => user?.UserId === form.watch("Agent")) || {};
      
      if (!targetAgent?.UserMobileNumber) {
        toast.error("Invalid agent selected");
        return;
      }

      const SIP_URL = window.APP_CONFIG.SIP_HOST;
      const sipUri = `sip:${targetAgent.UserMobileNumber}@${SIP_URL}`;
      
      const customHeaders = [
        `DI: ${agent.UserId}`,
        `DN: ${agent.UserMobileNumber}`,
        `CN: ${activeCall?.ClientNumber || ""}`,
        `CI: ${activeCall?.ClientId || ""}`,
        `CNM: ${activeCall?.ClientName || ""}`,
        `UC: ${activeCall?.DealerChannel || ""}`,
      ];

      const inviterOptions = { extraHeaders: customHeaders };
      await sessionManager?.call(sipUri, inviterOptions);
      
      closeConferenceModal();
      toast.success("Agent added to conference call");
    } catch (error) {
      console.error("Failed to add agent to conference", error);
      toast.error("Failed to add agent to conference");
    }
  };

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onClose={closeConferenceModal}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span>Add to Conference</span>
        </div>
      }
    >
      <div className="flex flex-col justify-between p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="Agent"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Select Agent
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Combobox
                            data={comboboxUserIds}
                            label="agent"
                            setValue={form.setValue}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedAgent}
                            placeholder="Search for an agent..."
                            className="w-full"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAddToConference}
                type="submit"
                className="w-full bg-[#f97316] hover:bg-[#f97316] text-white font-medium py-2.5"
                disabled={!Boolean(form.watch("Agent"))}
              >
                Add to Conference
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeConferenceModal}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}

export default ConferenceModal;