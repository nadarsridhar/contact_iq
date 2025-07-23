import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { userMasterSchema } from "@/schemas/userMaster";
import { deleteUserApi, updateUserApi } from "@/services/apiUser";
import { toast } from "sonner";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIONS } from "@/utils/actions";
import { useAuth } from "@/contexts/AuthContext";
import { getBranchesApi } from "@/services/apiBranches";
import { Combobox } from "@/components/ui/combobox";
import { IGetBranchRequestPayload } from "@/utils/interfaces";
import { UserCategory } from "@/utils/userCategory";
import { getMappedTemplateIds } from "@/services/apiTemplateMapping";
import globalState from "@/utils/globalState";
import {
  getPrivilegeTemplateIdsApi,
  IGetPrivilegeTemplateIdsRequest,
} from "@/services/apiPrivileges";

function CallTaskForm() {
  const { agent, isBranchAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const { onClose: closeModal, data, setData } = useCallTasksModal();
  const { action, modalData } = data.data ?? {};

  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [privilegeTemplates, setPrivilegeTemplates] = useState([]);

  const [searchedBranch, setSearchedBranch] = useState("");
  const [searchedTemplate, setSearchedTemplate] = useState("");
  const [searchedPrivilegeTemplate, setSearchedPrivilegeTemplate] =
    useState("");

  const comboboxData = branches?.map((branch) => ({
    label: branch.BranchName,
    value: branch.BranchName,
  }));

  async function fetchBranchList(payload: IGetBranchRequestPayload) {
    const { Data: data, MetaData: metaData } = await getBranchesApi(payload);
    setBranches(data);
  }

  const form = useForm<z.infer<typeof callTasksSchema>>({
    resolver: zodResolver(callTasksSchema),
    defaultValues: {
      TagId: 0,
      TaskType: 0,
      Priority: 0,
      Status: 0,
      StartTime: 0,
      EndTime: 0,
      FollowUpTime: 0,
      UUID: "",
      Title: "",
      Description: "",
      ClientId: "",
      ClientName: "",
      AttendedId: "",
      AttendedName: "",
      UserId: "",
      UserName: "",
    },
  });

  async function onSubmit(payload: z.infer<typeof callTasksSchema>) {
    try {
      setLoading(true);
      payload["OperationCode"] = action;
      payload["UpdatedBy"] = agent?.UserId;
      payload["LoginId"] = agent?.UserId;

      await updateCallTaskApi(payload);
      toast.success(
        `Task ${action === ACTIONS.UPDATE ? "updated" : "created"} successfully`
      );
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    try {
      const payload = {
        UserId: modalData.UserId,
        LoginId: agent.UserId,
        IsDeleted: modalData?.IsDeleted == 0 ? 1 : 0,
      };
      await deleteUserApi(payload);
      toast.success(
        `${globalState.AGENT_NAME} ${
          modalData?.IsDeleted == 0 ? "deleted" : "restored"
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

  const fetchTemplates = async () => {
    const isBranchAdminSelected =
      Number(form.getValues("UserCategory")) === UserCategory.BRANCH_ADMIN;

    const payload = {
      UserId: agent.UserId,
      StartIndex: 0,
      RecordsPerPage: 10,
      TemplateType: isBranchAdminSelected ? 1 : 2,
      MappingTemplateId: searchedTemplate,
    };

    const { Data: data, MetaData: metaData } = await getMappedTemplateIds(
      payload
    );
    setTemplates(data);
  };

  async function fetchPrivilegeTemplateIds(
    payload: IGetPrivilegeTemplateIdsRequest
  ) {
    try {
      const { Data: data, MetaData: metaData } =
        await getPrivilegeTemplateIdsApi(payload);

      if (isCreating) {
        const value = data.find((d) => d.includes("DEFAULT")) ?? "";
        form.setValue("PrivilegeTemplateId", value);
      }
      setPrivilegeTemplates(data);
    } catch (error) {
    } finally {
    }
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

  useEffect(() => {
    if (form.formState.errors) {
      console.log(form.formState.errors);
      if (Object.keys(form.formState.errors).length > 0) {
        // const error: any = Object.values(form.formState.errors)[0];
        // if (error?.message) toast.error(error?.message);
        // if (error?.ref?.name) form.setFocus(error?.ref?.name);
      }
    }
  }, [form.formState]); // ✅

  useEffect(() => {
    if (modalData && Object.keys(modalData)?.length > 0) {
      const {
        UserId,
        UserName,
        UserEmailId,
        UserCategory,
        UserMobileNumber,
        UserAlternateMobileNumber,
        WebRTCFlag,
        ActiveFlag,
        CallMode,
        UserStatus,
        BranchName,
        LoginMode,
        Password,
        Pin,
        CompanyName,
        MappingTemplateId,
        PrivilegeTemplateId,
        WorkingHoursTemplateId,
        AllowedIP,
        CreatedDate,
        LastUpdateDate,
        IsDeleted,
      } = modalData;
      console.log("Modal data", modalData);
      form.reset({
        UserId,
        UserName,
        UserMobileNumber,
        UserAlternateMobileNumber,
        CompanyName,
        Pin,
        UserEmailId,
        MappingTemplateId,
        CallMode: String(CallMode) ?? CALL_MODE[0].value,
        LoginMode: LOGIN_MODE[0].value,
        UserCategory: String(UserCategory),
        UserStatus: String(UserStatus) ?? USER_STATUS[0].value,
        WebRTCFlag: String(WebRTCFlag) ?? CALL_TYPES[0]?.value,
        BranchName,
        ActiveFlag: String(ActiveFlag) ?? ACTIVE_STATUS[0].value,
        PrivilegeTemplateId,
        WorkingHoursTemplateId,
        AllowedIP: AllowedIP ?? "{}",
        CreatedDate: CreatedDate ?? 0,
        LastUpdateDate: LastUpdateDate ?? 0,
        IsDeleted: IsDeleted ?? 0,
      });
      setUserCategory(String(UserCategory));
      setWebrtcFlag(String(WebRTCFlag) ?? CALL_TYPES[0]?.value);
      setLoginMode(LOGIN_MODE[0].value);
      setActiveFlag(String(ActiveFlag) ?? ACTIVE_STATUS[0].value);
      setUserStatus(String(UserStatus) ?? USER_STATUS[0].value);
      setCallMode(String(CallMode) ?? CALL_MODE[0].value);
    }
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedTemplate]);

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      SearchText: "",
      RecordsPerPage: 5,
      StartIndex: 0,
      UserCategory: Number(form.getValues("UserCategory")),
      TemplateId: searchedPrivilegeTemplate,
    };

    const handler = setTimeout(() => {
      if (
        (searchedPrivilegeTemplate && searchedPrivilegeTemplate.length > 2) ||
        !searchedPrivilegeTemplate
      ) {
        fetchPrivilegeTemplateIds(payload);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedPrivilegeTemplate, form.watch("UserCategory")]);

  const comboboxTemplateIds = templates.map((template) => ({
    label: template,
    value: template,
  }));

  const comboboxPrivilegeTemplateIds = privilegeTemplates.map((template) => ({
    label: template,
    value: template,
  }));

  const isSuperAdminSelected =
    Number(form.getValues("UserCategory")) === UserCategory.SUPER_ADMIN;
  const isBranchAdminSelected =
    Number(form.getValues("UserCategory")) === UserCategory.BRANCH_ADMIN;
  const isTeamManagerSelected =
    Number(form.getValues("UserCategory")) === UserCategory.TEAM_MANAGER;

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
            <span className="font-bold">{modalData?.UserId}</span> user?
          </p>

          <div className="flex justify-end mt-2 space-x-2">
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
                name="UserId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder={`${globalState.AGENT_NAME} ID..`}
                            onChange={(e) => {
                              if (isEditing) return;
                              return form.setValue(
                                field.name,
                                e.target.value.trim().toUpperCase()
                              );
                            }}
                            className={`${
                              isEditing && "opacity-50 cursor-not-allowed"
                            }`}
                            value={field.value}
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
                name="UserName"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder="Username.."
                            onChange={(e) =>
                              form.setValue(
                                field.name,
                                e.target.value.toUpperCase()
                              )
                            }
                            value={field.value}
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
                name="UserCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Category</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setUserCategory(val);
                        fetchTemplates();
                      }}
                      value={userCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${globalState.AGENT_NAME} category..`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_CATEGORIES.map(({ value, label }) => (
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
              <FormField
                control={form.control}
                name="UserMobileNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder="Mobile number.."
                            maxLength={10}
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
                name="UserAlternateMobileNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>DID Number</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder="Mobile number.."
                            maxLength={10}
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {!isSuperAdminSelected && (
                <FormField
                  control={form.control}
                  name="WebRTCFlag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Call Type</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          setWebrtcFlag(val);
                        }}
                        value={webrtcFlag}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user active.." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CALL_TYPES.map(({ value, label }) => (
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
              )}

              <FormField
                control={form.control}
                name="UserEmailId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                name="UserStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Status</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setUserStatus(val);
                      }}
                      value={userStatus}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user status.." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_STATUS.map(({ value, label }) => (
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

              {!isSuperAdminSelected && (
                <FormField
                  control={form.control}
                  name="BranchName"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl className="flex">
                          <Combobox
                            data={comboboxData}
                            label="branch"
                            setValue={(val) => {
                              form.setValue("BranchName", val);
                              form.setValue("PreferedAgentId1", "");
                              form.setValue("PreferedAgentId2", "");
                              form.setValue("PreferedAgentId3", "");
                            }}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedBranch}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              <FormField
                control={form.control}
                name="LoginMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auth Mode</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setLoginMode(Number(val));
                      }}
                      value={String(loginMode)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select login mode.." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOGIN_MODE.map(({ value, label }) => (
                          <SelectItem key={value} value={String(value)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(isTeamManagerSelected || isBranchAdminSelected) && (
                <FormField
                  control={form.control}
                  name="MappingTemplateId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          {isBranchAdminSelected && "B2B"}
                          {isTeamManagerSelected && "A2A"}
                          &nbsp;Mapping Template
                        </FormLabel>
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
              )}

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
                        <SelectTrigger>
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

              <FormField
                control={form.control}
                name="PrivilegeTemplateId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Privilege Template</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Combobox
                            data={comboboxPrivilegeTemplateIds}
                            label="template"
                            setValue={form.setValue}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedPrivilegeTemplate}
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

            <Button disabled={loading} type="submit" className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating.." : "Save"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

export default UsersForm;
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { userMasterSchema } from "@/schemas/userMaster";
import { deleteUserApi, updateUserApi } from "@/services/apiUser";
import { toast } from "sonner";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIONS } from "@/utils/actions";
import { useAuth } from "@/contexts/AuthContext";
import { getBranchesApi } from "@/services/apiBranches";
import { Combobox } from "@/components/ui/combobox";
import { IGetBranchRequestPayload } from "@/utils/interfaces";
import { UserCategory } from "@/utils/userCategory";
import { getMappedTemplateIds } from "@/services/apiTemplateMapping";
import globalState from "@/utils/globalState";
import {
  getPrivilegeTemplateIdsApi,
  IGetPrivilegeTemplateIdsRequest,
} from "@/services/apiPrivileges";
import { useCallTasksModal } from "@/hooks/useCallTasksModal";
import { callTasksSchema } from "@/schemas/followup";
import { updateCallTaskApi } from "@/services/apiFollowup";

const USER_STATUS = [
  { label: "Available", value: "1" },
  { label: "Away", value: "2" },
  { label: "Do Not Disturb", value: "3" },
];

export const ACTIVE_STATUS = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "0" },
];

const CALL_MODE = [
  { label: "Web", value: "1" },
  { label: "Mobile", value: "2" },
];

const LOGIN_MODE = [
  { label: "Traditional Login", value: 1 },
  { label: "LDAP", value: 2 },
  { label: "SSO", value: 3 },
];

const CALL_TYPES = [
  { label: "Internet Call", value: "1" },
  { label: "Normal Call", value: "2" },
];

export let USER_CATEGORIES_DATA = [
  { label: "Agent", value: String(UserCategory.Agent) },
  { label: "Super Admin", value: String(UserCategory.SUPER_ADMIN) },
  { label: "Branch Admin", value: String(UserCategory.BRANCH_ADMIN) },
  { label: "Team Manager", value: String(UserCategory.TEAM_MANAGER) },
];

function UsersForm() {
  const { agent, isBranchAdmin } = useAuth();
  const USER_CATEGORIES = isBranchAdmin
    ? USER_CATEGORIES_DATA.filter((el) => el?.label !== "Super Admin")
    : USER_CATEGORIES_DATA;

  const [loading, setLoading] = useState(false);
  const [userCategory, setUserCategory] = useState(USER_CATEGORIES[0].value);
  const [webrtcFlag, setWebrtcFlag] = useState(CALL_TYPES[0].value);
  const [loginMode, setLoginMode] = useState(Number(LOGIN_MODE[0].value));
  const [activeFlag, setActiveFlag] = useState(ACTIVE_STATUS[0].value);
  const [callMode, setCallMode] = useState(CALL_MODE[0].value);
  const [userStatus, setUserStatus] = useState(USER_STATUS[0].value);
  const { onClose: closeModal, data, setData } = useUserMasterModal();
  const { action, modalData } = data.data ?? {};

  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [privilegeTemplates, setPrivilegeTemplates] = useState([]);

  const [searchedBranch, setSearchedBranch] = useState("");
  const [searchedTemplate, setSearchedTemplate] = useState("");
  const [searchedPrivilegeTemplate, setSearchedPrivilegeTemplate] =
    useState("");

  const comboboxData = branches?.map((branch) => ({
    label: branch.BranchName,
    value: branch.BranchName,
  }));

  async function fetchBranchList(payload: IGetBranchRequestPayload) {
    const { Data: data, MetaData: metaData } = await getBranchesApi(payload);
    setBranches(data);
  }

  const form = useForm<z.infer<typeof userMasterSchema>>({
    resolver: zodResolver(userMasterSchema),
    defaultValues: {
      UserId: "",
      UserName: "",
      UserCategory: userCategory,
      UserMobileNumber: "",
      UserAlternateMobileNumber: "",
      CompanyName: "",
      WebRTCFlag: webrtcFlag,
      Pin: 0,
      UserEmailId: "",
      LoginMode: loginMode,
      ActiveFlag: activeFlag,
      CallMode: callMode,
      UserStatus: userStatus,
      BranchName: "",
      MappingTemplateId: "",
      PrivilegeTemplateId: "",
      WorkingHoursTemplateId: "",
      AllowedIP: "{}",
      CreatedDate: 0,
      LastUpdateDate: 0,
      IsDeleted: 0,
    },
  });

  async function onSubmit(payload: z.infer<typeof userMasterSchema>) {
    try {
      setLoading(true);
      payload["OperationCode"] = action;
      payload["UpdatedBy"] = agent?.UserId;
      payload["LoginMode"] = Number(payload.LoginMode);
      payload["LoginId"] = agent?.UserId;
      // payload["UserAlternateNumber"] = "";
      payload["CompanyName"] = "";

      await updateUserApi(payload);
      toast.success(
        `${globalState.AGENT_NAME} ${
          action === ACTIONS.UPDATE ? "updated" : "created"
        } successfully`
      );
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    try {
      const payload = {
        UserId: modalData.UserId,
        LoginId: agent.UserId,
        IsDeleted: modalData?.IsDeleted == 0 ? 1 : 0,
      };
      await deleteUserApi(payload);
      toast.success(
        `${globalState.AGENT_NAME} ${
          modalData?.IsDeleted == 0 ? "deleted" : "restored"
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

  const fetchTemplates = async () => {
    const isBranchAdminSelected =
      Number(form.getValues("UserCategory")) === UserCategory.BRANCH_ADMIN;

    const payload = {
      UserId: agent.UserId,
      StartIndex: 0,
      RecordsPerPage: 10,
      TemplateType: isBranchAdminSelected ? 1 : 2,
      MappingTemplateId: searchedTemplate,
    };

    const { Data: data, MetaData: metaData } = await getMappedTemplateIds(
      payload
    );
    setTemplates(data);
  };

  async function fetchPrivilegeTemplateIds(
    payload: IGetPrivilegeTemplateIdsRequest
  ) {
    try {
      const { Data: data, MetaData: metaData } =
        await getPrivilegeTemplateIdsApi(payload);

      if (isCreating) {
        const value = data.find((d) => d.includes("DEFAULT")) ?? "";
        form.setValue("PrivilegeTemplateId", value);
      }
      setPrivilegeTemplates(data);
    } catch (error) {
    } finally {
    }
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

  useEffect(() => {
    if (form.formState.errors) {
      console.log(form.formState.errors);
      if (Object.keys(form.formState.errors).length > 0) {
        // const error: any = Object.values(form.formState.errors)[0];
        // if (error?.message) toast.error(error?.message);
        // if (error?.ref?.name) form.setFocus(error?.ref?.name);
      }
    }
  }, [form.formState]); // ✅

  useEffect(() => {
    if (modalData && Object.keys(modalData)?.length > 0) {
      const {
        UserId,
        UserName,
        UserEmailId,
        UserCategory,
        UserMobileNumber,
        UserAlternateMobileNumber,
        WebRTCFlag,
        ActiveFlag,
        CallMode,
        UserStatus,
        BranchName,
        LoginMode,
        Password,
        Pin,
        CompanyName,
        MappingTemplateId,
        PrivilegeTemplateId,
        WorkingHoursTemplateId,
        AllowedIP,
        CreatedDate,
        LastUpdateDate,
        IsDeleted,
      } = modalData;
      console.log("Modal data", modalData);
      form.reset({
        UserId,
        UserName,
        UserMobileNumber,
        UserAlternateMobileNumber,
        CompanyName,
        Pin,
        UserEmailId,
        MappingTemplateId,
        CallMode: String(CallMode) ?? CALL_MODE[0].value,
        LoginMode: LOGIN_MODE[0].value,
        UserCategory: String(UserCategory),
        UserStatus: String(UserStatus) ?? USER_STATUS[0].value,
        WebRTCFlag: String(WebRTCFlag) ?? CALL_TYPES[0]?.value,
        BranchName,
        ActiveFlag: String(ActiveFlag) ?? ACTIVE_STATUS[0].value,
        PrivilegeTemplateId,
        WorkingHoursTemplateId,
        AllowedIP: AllowedIP ?? "{}",
        CreatedDate: CreatedDate ?? 0,
        LastUpdateDate: LastUpdateDate ?? 0,
        IsDeleted: IsDeleted ?? 0,
      });
      setUserCategory(String(UserCategory));
      setWebrtcFlag(String(WebRTCFlag) ?? CALL_TYPES[0]?.value);
      setLoginMode(LOGIN_MODE[0].value);
      setActiveFlag(String(ActiveFlag) ?? ACTIVE_STATUS[0].value);
      setUserStatus(String(UserStatus) ?? USER_STATUS[0].value);
      setCallMode(String(CallMode) ?? CALL_MODE[0].value);
    }
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedTemplate]);

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      SearchText: "",
      RecordsPerPage: 5,
      StartIndex: 0,
      UserCategory: Number(form.getValues("UserCategory")),
      TemplateId: searchedPrivilegeTemplate,
    };

    const handler = setTimeout(() => {
      if (
        (searchedPrivilegeTemplate && searchedPrivilegeTemplate.length > 2) ||
        !searchedPrivilegeTemplate
      ) {
        fetchPrivilegeTemplateIds(payload);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchedPrivilegeTemplate, form.watch("UserCategory")]);

  const comboboxTemplateIds = templates.map((template) => ({
    label: template,
    value: template,
  }));

  const comboboxPrivilegeTemplateIds = privilegeTemplates.map((template) => ({
    label: template,
    value: template,
  }));

  const isSuperAdminSelected =
    Number(form.getValues("UserCategory")) === UserCategory.SUPER_ADMIN;
  const isBranchAdminSelected =
    Number(form.getValues("UserCategory")) === UserCategory.BRANCH_ADMIN;
  const isTeamManagerSelected =
    Number(form.getValues("UserCategory")) === UserCategory.TEAM_MANAGER;

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
            <span className="font-bold">{modalData?.UserId}</span> user?
          </p>

          <div className="flex justify-end mt-2 space-x-2">
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
                name="UserId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder={`${globalState.AGENT_NAME} ID..`}
                            onChange={(e) => {
                              if (isEditing) return;
                              return form.setValue(
                                field.name,
                                e.target.value.trim().toUpperCase()
                              );
                            }}
                            className={`${
                              isEditing && "opacity-50 cursor-not-allowed"
                            }`}
                            value={field.value}
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
                name="UserName"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder="Username.."
                            onChange={(e) =>
                              form.setValue(
                                field.name,
                                e.target.value.toUpperCase()
                              )
                            }
                            value={field.value}
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
                name="UserCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Category</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setUserCategory(val);
                        fetchTemplates();
                      }}
                      value={userCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${globalState.AGENT_NAME} category..`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_CATEGORIES.map(({ value, label }) => (
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
              <FormField
                control={form.control}
                name="UserMobileNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder="Mobile number.."
                            maxLength={10}
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
                name="UserAlternateMobileNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>DID Number</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            {...field}
                            placeholder="Mobile number.."
                            maxLength={10}
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {!isSuperAdminSelected && (
                <FormField
                  control={form.control}
                  name="WebRTCFlag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Call Type</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          setWebrtcFlag(val);
                        }}
                        value={webrtcFlag}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user active.." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CALL_TYPES.map(({ value, label }) => (
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
              )}

              <FormField
                control={form.control}
                name="UserEmailId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                name="UserStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Status</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setUserStatus(val);
                      }}
                      value={userStatus}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user status.." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_STATUS.map(({ value, label }) => (
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

              {!isSuperAdminSelected && (
                <FormField
                  control={form.control}
                  name="BranchName"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl className="flex">
                          <Combobox
                            data={comboboxData}
                            label="branch"
                            setValue={(val) => {
                              form.setValue("BranchName", val);
                              form.setValue("PreferedAgentId1", "");
                              form.setValue("PreferedAgentId2", "");
                              form.setValue("PreferedAgentId3", "");
                            }}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedBranch}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              <FormField
                control={form.control}
                name="LoginMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auth Mode</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setLoginMode(Number(val));
                      }}
                      value={String(loginMode)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select login mode.." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOGIN_MODE.map(({ value, label }) => (
                          <SelectItem key={value} value={String(value)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(isTeamManagerSelected || isBranchAdminSelected) && (
                <FormField
                  control={form.control}
                  name="MappingTemplateId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          {isBranchAdminSelected && "B2B"}
                          {isTeamManagerSelected && "A2A"}
                          &nbsp;Mapping Template
                        </FormLabel>
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
              )}

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
                        <SelectTrigger>
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

              <FormField
                control={form.control}
                name="PrivilegeTemplateId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Privilege Template</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Combobox
                            data={comboboxPrivilegeTemplateIds}
                            label="template"
                            setValue={form.setValue}
                            getValues={() => form.getValues(field.name)}
                            setSearchText={setSearchedPrivilegeTemplate}
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

            <Button disabled={loading} type="submit" className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating.." : "Save"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

export default CallTaskForm;
