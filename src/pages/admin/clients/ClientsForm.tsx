import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { clientMasterSchema } from "@/schemas/clients";
import { ACTIONS } from "@/utils/actions";
import { deleteClientApi, updateClientApi } from "@/services/apiClients";
import { useClientModal } from "@/hooks/useClientModal";
import { useAuth } from "@/contexts/AuthContext";
import { getBranchesApi } from "@/services/apiBranches";
import { Combobox } from "@/components/ui/combobox";
import { getUserIdsByBranch, getUsersApi } from "@/services/apiUser";
import {
  IGetBranchRequestPayload,
  IGetUserRequestPayload,
} from "@/utils/interfaces";
import { getMappedTemplateIds } from "@/services/apiTemplateMapping";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVE_STATUS } from "../users/UsersForm";
import { UserCategory } from "@/utils/userCategory";

function ClientsForm() {
  const [loading, setLoading] = useState(false);
  const { onClose: closeModal, data, setData } = useClientModal();
  const { agent } = useAuth();

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeFlag, setActiveFlag] = useState(ACTIVE_STATUS[0].value);
  const [searchedBranch, setSearchedBranch] = useState("");
  const [searchedAgent, setSearchedAgent] = useState("");
  const [searchedTemplate, setSearchedTemplate] = useState("");

  const comboboxBranchIds = branches.map(({ BranchName }) => ({
    label: BranchName,
    value: BranchName,
  }));
  const comboboxUserIds = users.map(({ UserId, UserName }) => ({
    label: `${UserId} (${UserName})`,
    value: UserId,
  }));

  const { action, modalData } = data.data;

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

  const form = useForm<z.infer<typeof clientMasterSchema>>({
    resolver: zodResolver(clientMasterSchema),
    defaultValues: {
      ClientId: "",
      ClientName: "",
      ClientNumber: "",
      ClientAlternateNumber: "",
      ClientEmailId: "",
      Tpin: 0,
      BranchName: "",
      PreferedAgentId1: "",
      PreferedAgentId2: "",
      PreferedAgentId3: "",
      MappingTemplateId: "",
      ActiveFlag: 1,
      CreatedDate: 0,
      LastUpdateDate: 0,
      IsDeleted: 0,
    },
  });

  const fetchTemplates = async () => {
    const payload = {
      UserId: agent.UserId,
      StartIndex: 0,
      RecordsPerPage: 10,
      TemplateType: 2,
      MappingTemplateId: searchedTemplate,
    };
    const { Data: data, MetaData: metaData } = await getMappedTemplateIds(
      payload
    );
    setTemplates(data);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedTemplate]);

  const selectedBranch = form.watch("BranchName");
  useEffect(() => {
    if (selectedBranch) {
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
    }
  }, [selectedBranch, searchedAgent]);

  async function onSubmit(payload: z.infer<typeof clientMasterSchema>) {
    try {
      setLoading(true);
      payload["OperationCode"] = action;
      payload["UpdatedBy"] = agent?.UserId;
      payload["ClientAlternateNumber"] = "";
      payload["WebRTCFlag"] = 1;
      await updateClientApi(payload);
      toast.success(
        `Client ${
          action === ACTIONS.UPDATE ? "updated" : "created"
        } successfully`
      );
      closeModal();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.response?.data?.message ?? error?.message
      );
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    try {
      const payload = {
        LoginId: agent.UserId,
        ClientId: modalData.ClientId,
        IsDeleted: modalData?.IsDeleted == 0 ? 1 : 0,
      };
      await deleteClientApi(payload);
      toast.success(
        `Client ${
          modalData.IsDeleted == 0 ? "deleted" : "restored"
        } successfully`
      );
      closeModal();
      setData({});
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(data)?.length > 0 && action === ACTIONS.UPDATE) {
      const {
        ClientId,
        ClientName,
        ClientNumber,
        ClientAlternateNumber,
        ClientEmailId,
        WebRTCFlag,
        Tpin,
        BranchName,
        PreferedAgentId1,
        PreferedAgentId2,
        PreferedAgentId3,
        MappingTemplateId,
        ActiveFlag,
        CreatedDate,
        LastUpdateDate,
        IsDeleted,
      } = data?.data?.modalData || {};

      form.reset({
        ClientId,
        ClientName,
        ClientNumber,
        ClientAlternateNumber,
        ClientEmailId,
        Tpin,
        BranchName,
        PreferedAgentId1,
        PreferedAgentId2,
        PreferedAgentId3,
        MappingTemplateId,
        WebRTCFlag,
        ActiveFlag,
        CreatedDate,
        LastUpdateDate,
        IsDeleted,
      });
      setActiveFlag(String(ActiveFlag) ?? ACTIVE_STATUS[0].value);
    }
  }, [data]);

  useEffect(() => {
    if (form.formState.errors) {
      if (Object.keys(form.formState.errors).length > 0) {
        const error: any = Object.values(form.formState.errors)[0];
        console.log("Error", error);
        // if (error?.message) toast.error(error?.message);
        // if (error?.ref?.name) form.setFocus(error?.ref?.name);
      }
    }
  }, [form.formState]); // ✅

  const onBranchChange = (val) => {
    form.setValue("BranchName", val);
    form.setValue("PreferedAgentId1", "");
    form.setValue("PreferedAgentId2", "");
    form.setValue("PreferedAgentId3", "");
  };

  const comboboxTemplateIds = templates.map((template) => ({
    label: template,
    value: template,
  }));

  const isEditing = action === ACTIONS.UPDATE;
  const isCreating = action === ACTIONS.CREATE;
  const isDeleting =
    action === ACTIONS.DELETE && data?.data?.modalData?.IsDeleted == 0;
  const isRestoring =
    action === ACTIONS.DELETE && data?.data?.modalData?.IsDeleted == 1;

  return (
    <div className="flex flex-col justify-between">
      {(isDeleting || isRestoring) && (
        <div>
          <p>
            Are you sure you want to {isDeleting ? "delete" : "restore"}{" "}
            <span className="font-bold">{modalData?.ClientId}</span> client?
          </p>

          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={handleDelete} variant="destructive">
              {isDeleting ? "Delete" : "Restore"}
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </div>
        </div>
      )}
      {(isCreating || isEditing) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <FormField
                control={form.control}
                name="ClientId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            className={`${
                              isEditing && "opacity-50 cursor-not-allowed"
                            }`}
                            onChange={(e) => {
                              if (isEditing) return;
                              return form.setValue(
                                field.name,
                                e.target.value.trim().toUpperCase()
                              );
                            }}
                            placeholder="Client id.."
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="ClientName"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            onChange={(e) =>
                              form.setValue(
                                field.name,
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="Client name.."
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="ClientNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input {...field} maxLength={10} />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="ClientEmailId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input {...field} />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="Tpin"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Tpin</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            maxLength={4}
                            type="number"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d{0,4}$/.test(value)) {
                                field.onChange(
                                  value === "" ? 0 : parseInt(value)
                                );
                              }
                            }}
                            placeholder="Enter 4-digit TPIN"
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="BranchName"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Combobox
                            data={comboboxBranchIds}
                            label="branch"
                            setValue={onBranchChange}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedBranch}
                            {...field}
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="PreferedAgentId1"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Pref. Agent 1</FormLabel>
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

              <FormField
                control={form.control}
                name="PreferedAgentId2"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Pref. Agent 2</FormLabel>
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

              <FormField
                control={form.control}
                name="PreferedAgentId3"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Pref. Agent 3</FormLabel>
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

              <FormField
                control={form.control}
                name="MappingTemplateId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Mapped Template</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Combobox
                            data={comboboxTemplateIds}
                            label="templates"
                            setValue={form.setValue}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedTemplate}
                            {...field}
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="ActiveFlag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Active</FormLabel>
                    <Select 
                      onValueChange={(val) => {
                        field.onChange(val);
                        setActiveFlag(val);
                      }}
                      value={activeFlag}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-100">
                          <SelectValue placeholder="Select user active.." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVE_STATUS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={loading} type="submit" className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving.." : "Save"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

export default ClientsForm;
