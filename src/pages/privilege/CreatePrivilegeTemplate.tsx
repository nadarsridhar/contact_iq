import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useReducer, useState } from "react";

import { templateFormSchema } from "@/schemas/templateMapping";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { privilegeFormSchema } from "@/schemas/privilegeSchema";
import { USER_CATEGORIES_DATA } from "../admin/users/UsersForm";
import ConfigurePrivileges from "./ConfigurePrivileges";
import {
  getDefaultPrivilegeTemplateApi,
  getPrivilegeTemplateApi,
  getPrivilegeTemplateIdsApi,
  IGetDefaultPrivilegeTemplateIdsRequest,
  IGetPrivilegeTemplateIdsRequest,
  updatePrivilegTemplateApi,
} from "@/services/apiPrivileges";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PrivilegeKey, PrivilegeValue } from "@/utils/privileges";
import { ACTIONS } from "@/utils/actions";

interface PrivilegeState {
  [key: string]: number;
}

type PrivilegeAction = {
  type: PrivilegeKey;
  value: PrivilegeValue;
};

const SET_INITIAL_STATE = "SET_INITIAL_STATE";

function reducer(
  state: PrivilegeState,
  action: PrivilegeAction
): PrivilegeState {
  if (action.type === SET_INITIAL_STATE) {
    return { ...state, ...action.value };
  }

  return { ...state, [action.type]: state[action.type] ^ action.value };
}

function CreatePrivilegeTemplate() {
  const [defaultPrivileges, setDefaultPrivileges] = useState();
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { agent } = useAuth();
  const [state, dispatch] = useReducer(reducer, {});
  const [isEditable, setIsEditable] = useState(false);

  const form = useForm<z.infer<typeof privilegeFormSchema>>({
    resolver: zodResolver(privilegeFormSchema),
    defaultValues: {
      UserCategory: USER_CATEGORIES_DATA[0].value,
      PrivilegeTemplateId: "",
    },
  });

  const { formState } = form;

  useEffect(() => {
    if (Object.keys(formState.errors).length > 0) {
      console.log("Form errors", formState.errors);
      // do the your logic here
    }
  }, [formState]); // ✅

  async function onSubmit(values: z.infer<typeof templateFormSchema>) {
    try {
      setLoading(true);
      const payload = {
        OperationCode: !isEditable ? ACTIONS.UPDATE : ACTIONS.CREATE,
        UserCategory: values.UserCategory,
        IsDeleted: 0,
        PrivilegeTemplateId: values.PrivilegeTemplateId,
        MenuInfo: JSON.stringify({}),
        PrivilegeInfo: JSON.stringify(state),
        Remarks: "",
        UpdatedBy: agent.UserId,
      };
      await updatePrivilegTemplateApi(payload);
      resetValues();
      toast.success(`Template updated successfully`);
    } catch (error) {
      // console.error(error);
      toast.error(error ?? error?.message);
    } finally {
      setLoading(false);
    }
  }

  const comboboxTemplateIds = templates.map((template) => ({
    label: template,
    value: template,
  }));

  const handleClearForm = (e) => {
    e?.preventDefault();
    form.reset();
  };

  async function fetchDefaultPrivilegeTemplateIds(
    payload: IGetDefaultPrivilegeTemplateIdsRequest
  ) {
    try {
      const { Data: data, MetaData: metaData } =
        await getDefaultPrivilegeTemplateApi(payload);
      dispatch({ type: SET_INITIAL_STATE, value: data.PrivilegeInfo });
      setDefaultPrivileges(data.PrivilegeInfo);
    } catch (error) {
    } finally {
    }
  }

  async function fetchPrivilegeTemplateIds(
    payload: IGetPrivilegeTemplateIdsRequest
  ) {
    try {
      const { Data: data, MetaData: metaData } =
        await getPrivilegeTemplateIdsApi(payload);
      setTemplates(data);
    } catch (error) {
    } finally {
    }
  }

  async function fetchPrivilegesForTemplate(payload: {
    UserCategory: string;
    TemplateId: string;
  }) {
    const { Data: data, MetaData: metaData } = await getPrivilegeTemplateApi(
      payload
    );
    dispatch({ type: SET_INITIAL_STATE, value: data.PrivilegeInfo });
  }

  const resetValues = () => {
    form.setValue("PrivilegeTemplateId", "");
    setIsEditable(false);
    dispatch({
      type: SET_INITIAL_STATE,
      value: defaultPrivileges,
    });
  };

  // Fetch privilege templates
  useEffect(() => {
    const PrivilegeTemplateId = form.getValues("PrivilegeTemplateId");
    const payload = {
      UserId: agent.UserId,
      SearchText: "",
      RecordsPerPage: 10,
      StartIndex: 0,
      UserCategory: Number(form.getValues("UserCategory")),
      TemplateId: PrivilegeTemplateId,
    };

    const handler = setTimeout(() => {
      if (
        (PrivilegeTemplateId && PrivilegeTemplateId.length > 2) ||
        !PrivilegeTemplateId
      ) {
        fetchPrivilegeTemplateIds(payload);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [form.watch("PrivilegeTemplateId"), form.watch("UserCategory")]);

  // Fetch privileges for templates
  useEffect(() => {
    const UserCategory = form.getValues("UserCategory");
    const PrivilegeTemplateId = form.getValues("PrivilegeTemplateId");

    let handler;

    if (!PrivilegeTemplateId && UserCategory) {
      fetchDefaultPrivilegeTemplateIds({
        UserCategory: Number(UserCategory),
      });
    } else if (PrivilegeTemplateId && UserCategory) {
      handler = setTimeout(() => {
        fetchPrivilegesForTemplate({
          UserCategory,
          TemplateId: PrivilegeTemplateId,
        });
      }, 300);
    }

    return () => clearTimeout(handler);
  }, [form.watch("UserCategory"), form.watch("PrivilegeTemplateId")]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-end my-4">
            <FormField
              control={form.control}
              name="UserCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Category</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      resetValues();
                    }}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-100 border-gray-300">
                        <SelectValue placeholder="Select a user category.." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_CATEGORIES_DATA.map(({ value, label }) => (
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

            {!isEditable && (
              <FormField
                control={form.control}
                name="PrivilegeTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>

                    <FormControl>
                      <Combobox
                        data={comboboxTemplateIds}
                        label="templates"
                        setValue={form.setValue}
                        getValues={() => form.getValues(field.name)}
                        setSearchText={(val) => form.setValue(field.name, val)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditable && (
              <FormField
                control={form.control}
                name="PrivilegeTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add Template</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  resetValues();
                  setIsEditable(!isEditable);
                }}
              >
                <PlusIcon />
              </Button>
            </div>
          </div>

          <ConfigurePrivileges state={state} dispatch={dispatch} />

          <div className="space-x-4 mt-4">
            <Button disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            <Button onClick={handleClearForm}>Cancel</Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default CreatePrivilegeTemplate;
