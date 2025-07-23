import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

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
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMappedTemplate,
  getMappedTemplateIds,
  updateTemplateMappingApi,
} from "@/services/apiTemplateMapping";
import { Combobox } from "@/components/ui/combobox";
import { TEMPLATE_TYPE, TEMPLATE_TYPES } from "./index";
import BranchToBranchList from "./branches/BranchToBranchList";
import UserToUserList from "./users/UserToUserList";

function TemplateMappingForm() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [searchedTemplate, setSearchedTemplate] = useState("");

  const [branches, setBranches] = useState([]);
  const [branchesToMap, setBranchesToMap] = useState([]);

  const [users, setUsers] = useState([]);
  const [usersToMap, setUsersToMap] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const { agent } = useAuth();

  const form = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      TemplateType: TEMPLATE_TYPES[0].value,
      MappingTemplateId: "",
    },
  });

  const { formState } = form;

  useEffect(() => {
    if (Object.keys(formState.errors).length > 0) {
      console.log("Form errors", formState.errors);
      // do the your logic here
    }
  }, [formState]); // ✅

  const fetchTemplates = async () => {
    try {
      const payload = {
        UserId: agent.UserId,
        StartIndex: 0,
        RecordsPerPage: 10,
        TemplateType: Number(form.getValues("TemplateType")),
        MappingTemplateId: searchedTemplate,
      };
      const { Data: data, MetaData: metaData } = await getMappedTemplateIds(
        payload
      );
      setTemplates(data);
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const fetchSingleTemplate = async (templateId: string) => {
    if (!templateId) return;

    try {
      const payload = {
        TemplateType: Number(form.getValues("TemplateType")),
        TemplateId: templateId,
      };
      const { Data: data } = await getMappedTemplate(payload);

      if (form.getValues("TemplateType") == TEMPLATE_TYPE.BRANCH_TO_BRANCH) {
        setBranchesToMap(data.UserList);
      } else {
        setUsersToMap(data.UserList);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  async function onSubmit(values: z.infer<typeof templateFormSchema>) {
    try {
      setLoading(true);
      const templateType = values.TemplateType;
      const payload = {
        TemplateId: values.MappingTemplateId,
        TemplateType: Number(templateType),
        UserList:
          templateType == TEMPLATE_TYPE.BRANCH_TO_BRANCH
            ? branchesToMap.map((b) => b.BranchName)
            : usersToMap.map((u) => u.UserId),
        UserCount:
          templateType == TEMPLATE_TYPE.BRANCH_TO_BRANCH
            ? branchesToMap.length
            : usersToMap.length,
        UpdatedBy: agent.UserId,
      };

      if (!payload.TemplateId) {
        toast.error(`Select a template`);
        return;
      } else if (
        templateType == TEMPLATE_TYPE.BRANCH_TO_BRANCH &&
        payload.UserList.length === 0
      ) {
        toast.error(`Atleast one branch mapping is required`);
        return;
      } else if (
        templateType == TEMPLATE_TYPE.AGENT_TO_AGENT &&
        payload.UserList.length === 0
      ) {
        toast.error(`Atleast one user mapping is required`);
        return;
      }

      await updateTemplateMappingApi(payload);
      toast.success(`Template updated successfully`);

      // Reset values
      form.reset();
      setIsEditable(false);
      setTemplates([]);
      setUsersToMap([]);
      setBranchesToMap([]);

      setTimeout(async () => {
        await fetchTemplates();
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? error?.message);
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
    clearLists();
  };

  const clearLists = () => {
    setBranchesToMap([]);
    setUsersToMap([]);
    setTemplates([]);
    setUsers([]);
    setBranches([]);
    setIsEditable(false);
    setSearchedTemplate("");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(handler);
  }, [form.watch("TemplateType"), searchedTemplate]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full lg:w-2/5 flex flex-col md:flex-row gap-4 mt-4 md:items-end bg-white rounded-lg shadow-sm border border-gray-100">
            <FormField
              control={form.control}
              name="TemplateType"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Mapping Type
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      console.log(val);
                      field.onChange(val);
                      form.reset();
                      clearLists();
                      form.setValue("TemplateType", val);
                    }}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select a mapping type.." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            {!isEditable && (
              <FormField
                control={form.control}
                name="MappingTemplateId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Template
                    </FormLabel>

                    <FormControl>
                      <Combobox
                        data={comboboxTemplateIds}
                        label="templates"
                        setValue={(val) => {
                          if (val === "MappingTemplateId") return;
                          form.setValue(field.name, val);
                          fetchSingleTemplate(val);
                        }}
                        getValues={() => form.getValues(field.name)}
                        setSearchText={setSearchedTemplate}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            )}

            {isEditable && (
              <FormField
                control={form.control}
                name="MappingTemplateId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Add Template
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                        className="w-full border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-end">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditable(!isEditable);
                  // fetchTemplates();
                }}
                className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 lg:px-5 w-full transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mt-4 space-x-4 flex items-center">
            <Button disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            <Button onClick={handleClearForm}>Cancel</Button>
          </div>
        </form>
      </Form>

      {form.watch("TemplateType") == TEMPLATE_TYPE.BRANCH_TO_BRANCH && (
        <BranchToBranchList
          branchesToMap={branchesToMap}
          setBranchesToMap={setBranchesToMap}
          branches={branches}
          setBranches={setBranches}
        />
      )}

      {form.watch("TemplateType") == TEMPLATE_TYPE.AGENT_TO_AGENT && (
        <UserToUserList
          usersToMap={usersToMap}
          setUsersToMap={setUsersToMap}
          users={users}
          setUsers={setUsers}
        />
      )}
    </>
  );
}

export default TemplateMappingForm;
