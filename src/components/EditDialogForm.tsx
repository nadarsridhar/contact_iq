import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { callSchema } from "@/schemas/call";
import { updateClientRecordsApi } from "@/services/apiCalls";
import { useEditHistory } from "@/hooks/useEditCallHistory";
import { Textarea } from "./ui/textarea";
import { getClientsByMobileNumber } from "@/services/apiClients";
import { TAG_FILTER } from "@/utils/filter";
import { ITagFilter } from "@/utils/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { MultiSelectDropdown } from "./multi-select-dropdown";
import MultipleSelector from "./MultipleSelector";

function EditDialogForm({ clientDetailsData, loadCallLogs }) {
  const selectedClientsData = [];
  if (clientDetailsData?.ClientId) {
    selectedClientsData.push({
      key: clientDetailsData?.ClientId,
      value: clientDetailsData?.ClientId,
    });
  }
  if (clientDetailsData?.TaggedClientIds?.length > 0) {
    clientDetailsData?.TaggedClientIds.split(",").forEach((el) =>
      selectedClientsData.push({ key: el, value: el })
    );
  }

  const [clients, setClients] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // To manage individual dropdowns
  const [selectedClients, setSelectedClients] = useState(selectedClientsData);

  const [loading, setLoading] = useState(false);
  const { agent } = useAuth();
  const { onClose, data: modalData, setData } = useEditHistory();

  const form = useForm<z.infer<typeof callSchema>>({
    resolver: zodResolver(callSchema),
    defaultValues: {
      ClientId: clientDetailsData?.ClientId ?? "",
      Remarks: clientDetailsData?.Remarks ?? "",
      TagId: clientDetailsData?.TagId ?? 0,
    },
  });

  async function onSubmit(values: z.infer<typeof callSchema>) {
    if (selectedClients?.length === 0) {
      return toast.error("Client ID is required");
    }

    const tagId = selectedTags.reduce(
      (acc, curVal: ITagFilter) => acc + curVal.value,
      0
    );

    const { Feedback, UniqueCallIdentifier, UserId, StartTime } =
      clientDetailsData;
    const { Remarks } = values;
    let TaggedClientIds = "";
    selectedClients
      .slice(1)
      .forEach((el, index) =>
        index === selectedClients.length - 2
          ? (TaggedClientIds += el.value)
          : (TaggedClientIds += el.value + ",")
      );
    const payload = {
      Feedback,
      TagId: tagId,
      UniqueCallIdentifier,
      ClientId: selectedClients[0]?.value ?? values.ClientId,
      UserId,
      Remarks,
      UpdatedBy: agent.UserId,
      TaggedClientIds,
      StartTime,
    };

    try {
      setLoading(true);
      await updateClientRecordsApi(payload);

      loadCallLogs();
      toast.success(`Call details updated successfully`);
      onClose();
    } catch (error) {
      console.log(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch users
  async function fetchClientsByMobileNumber(payload: { ClientNumber: string }) {
    const { Data: data, MetaData: totalRecordsData } =
      await getClientsByMobileNumber(payload);
    if (data.length > 0) {
      setClients(data);
    }
  }

  function getTagsFromBitwiseNumber(bitwiseNumber: number): ITagFilter[] {
    return TAG_FILTER.filter(
      (tag) => tag.value > 0 && (bitwiseNumber & tag.value) !== 0
    ).map((tag) => tag);
  }

  useEffect(() => {
    if (clientDetailsData && Object.keys(clientDetailsData)?.length > 0) {
      setSelectedTags(getTagsFromBitwiseNumber(clientDetailsData.TagId));
      form.reset(clientDetailsData);
      fetchClientsByMobileNumber({
        ClientNumber: clientDetailsData?.ClientNumber,
      });
    }
  }, [clientDetailsData]);

  useEffect(() => {
    if (form.formState.errors) {
      console.log(form.formState.errors);
      // if (Object.keys(form.formState.errors).length > 0) {
      //   const error: any = Object.values(form.formState.errors)[0];
      //   if (error?.message) toast.error(error?.message);
      //   if (error?.ref?.name) form.setFocus(error?.ref?.name);
      // }
    }
  }, [form.formState]); // ✅

  const CLIENTS_OPTIONS = clients.map((clientId) => ({
    key: clientId,
    value: clientId,
  }));

  return (
    <div className="flex flex-col justify-between">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="ClientId"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="mb-4">Client ID</FormLabel>
                  <MultipleSelector
                    selected={selectedClients}
                    setSelected={setSelectedClients}
                    options={CLIENTS_OPTIONS}
                    placeholder="Select client ids..."
                    hidePlaceholderWhenSelected
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        No client ids found.
                      </p>
                    }
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="Remarks"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl className="flex">
                    <>
                      <Textarea
                        {...field}
                        value={field.value}
                        showCounter
                        maxLimit={100}
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
            name="TagId"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="mb-4">Tags</FormLabel>
                  <MultiSelectDropdown
                    selectedItems={selectedTags}
                    setSelectedItems={setSelectedTags}
                    options={TAG_FILTER}
                    label="tags"
                    className="flex-wrap gap-2"
                    showTags
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <Button disabled={loading} type="submit" className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default EditDialogForm;
