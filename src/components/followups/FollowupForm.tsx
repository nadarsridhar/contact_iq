import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "rsuite";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { followupTaskSchema } from "@/schemas/followup";
import { Input } from "@/components/ui/input";
import { updateFollowupApi } from "@/services/apiFollowup";
import { useCreateFollowup } from "@/hooks/useCreateFollowup";
import { useAuth } from "@/contexts/AuthContext";
import { getDayRangeEpoch } from "@/utils";
import { ACTIONS } from "@/utils/actions";
import { TaskStatus, TaskType } from "@/utils/followup";
import { Switch } from "../ui/switch";

function FollowupForm() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(Date.now() + 60 * 1000)
  );
  const {
    onClose,
    data: followupData = {},
    setTriggerApiRefresh,
  } = useCreateFollowup();
  const { agent, featureFlags } = useAuth();
  const [startDateEpoch] = getDayRangeEpoch([new Date(), new Date()]);

  const form = useForm<z.infer<typeof followupTaskSchema>>({
    resolver: zodResolver(followupTaskSchema),
    defaultValues: {
      OperationCode: ACTIONS.CREATE,
      Title: "",
      Description: "",
      FollowUpTime: 0,
      AutoFlag: 0,
      TagId: 0,
      TaskType: TaskType.CallReminder,
      Priority: 0,
      Status: TaskStatus.Todo,
      StartTime: 0,
      EndTime: 0,
      UUID: "",
      UniqueCallIdentifier: "",
      ClientId: "",
      ClientName: "",
      ClientNumber: "",
      AttendedId: "",
      AttendedName: "",
      UserId: "",
      UserName: "",
      TemplateId: "",
      BranchName: "",
      Reason: "",
      UpdatedBy: "",
    },
  });

  async function onSubmit(values: z.infer<typeof followupTaskSchema>) {
    try {
      const followupTimeEpoch = Math.floor(selectedDate.setSeconds(0) / 1000);
      setLoading(true);

      const payload = {
        ...values,
        UserId: agent.UserId,
        UpdatedBy: agent.UserId,
        UserName: agent.UserName,
        FollowUpTime: followupTimeEpoch,
        StartTime: startDateEpoch,
        EndTime: followupTimeEpoch + 1,
      };
      await updateFollowupApi(payload);
      toast.success(`Follow up updated successfully`);
      setTriggerApiRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (form.formState.errors) {
      // console.log(form.formState.errors);
      // if (Object.keys(form.formState.errors).length > 0) {
      //   const error: any = Object.values(form.formState.errors)[0];
      //   if (error?.message) toast.error(error?.message);
      //   if (error?.ref?.name) form.setFocus(error?.ref?.name);
      // }
    }
  }, [form.formState]); // ✅

  useEffect(() => {
    if (followupData && Object.keys(followupData)?.length > 0) {
      form.reset({
        ...followupData,
        UniqueCallIdentifier: followupData?.UniqueCallIdentifier ?? "",
        AutoFlag: followupData?.AutoFlag ?? 0,
        UpdatedBy: agent.UserId,
        AttendedId: followupData?.UserId ?? agent.UserId,
        AttendedName: followupData?.UserName ?? agent.UserName,
        UUID: followupData?.UUID ?? "",
        TemplateId: followupData?.TemplateId ?? "",
        TaskType: TaskType.CallReminder,
        Priority: 0,
        Status: followupData?.Status ?? TaskStatus.Todo,
        Reason: followupData?.Reason ?? "",
      });
    }
  }, [followupData, agent.UserId]);

  return (
    <div className="flex flex-col justify-between">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="Title"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl className="flex">
                    <>
                      <Input
                        {...field}
                        placeholder="Title.."
                        onChange={(e) =>
                          form.setValue(field.name, e.target.value)
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
            name="Description"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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

          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="FollowUpTime"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Follow up Time</FormLabel>
                    <FormControl className="ml-2">
                      <DatePicker
                        // format="dd-MM-yyyy HH:mm"
                        format="yyyy-MM-dd HH:mm"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Select a date range"
                        size="xs"
                        // TODO: Disable past dates
                        disabledDate={(date) =>
                          date.getTime() < new Date().setSeconds(0, 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {featureFlags.AutoCallFeature && (
              <FormField
                control={form.control}
                name="AutoFlag"
                render={({ field }) => {
                  return (
                    <FormItem className="flex items-center">
                      <FormLabel>Auto call</FormLabel>
                      <FormControl className="ml-2">
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>

          <Button disabled={loading} type="submit" className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default FollowupForm;
