import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getGlobalSettingsApi,
  updateDefaultPasswordApi,
  updateGlobalSettingsApi,
} from "@/services/apiGlobalSettings";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { convertToMD5 } from "@/lib/utils";
import { format } from "date-fns";

// Define the form schema with validation
const formSchema = z.object({
  ResetPreferredUsers: z.union([
    z
      .boolean()
      .default(true)
      .transform((val) => (val ? 1 : 0)),
    z.number().refine((val) => val === 0 || val === 1, {
      message: "Only 0 or 1 allowed",
    }),
  ]),
  PWExpireDays: z.number().int().min(0).max(365),
  TaskTTL: z.number().int().min(1).max(52),
  DefaultPW: z.string().optional(),
  DefaultTPIN: z.number().int().min(1000).max(9999),
  TEReportRetentionDays: z.number().int().min(1).max(52),
  IsEmailReq: z.union([
    z
      .boolean()
      .default(true)
      .transform((val) => (val ? 1 : 0)),
    z.number().refine((val) => val === 0 || val === 1, {
      message: "Only 0 or 1 allowed",
    }),
  ]),
  AutoCallFeature: z.number(),
  AllowedClientIdUpdateDays: z.number().int().min(0).max(365),
});

export type FormValues = z.infer<typeof formSchema>;

export default function GlobalSettings() {
  const [defaultPassword, setDefaultPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultPasswordloading, setDefaultPasswordLoading] = useState(false);
  const { agent } = useAuth();
  const { isGlobalSettingsReadAllowed } = usePrivilege();
  const [metaData, setMetaData] = useState();

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ResetPreferredUsers: 1,
      PWExpireDays: 30,
      TaskTTL: 28,
      DefaultPW: "",
      DefaultTPIN: 1234,
      TEReportRetentionDays: 28,
      IsEmailReq: 1,
      AllowedClientIdUpdateDays: 1,
      AutoCallFeature: 1,
    },
  });

  async function onSubmit(data: FormValues) {
    let newData = {
      ...data,
      EnabledDeletion: 3,
    };
    const payload = {
      UserId: agent.UserId,
      SettingsValue: JSON.stringify(newData),
    };

    try {
      setLoading(true);
      await updateGlobalSettingsApi(payload);
      fetchGlobalSettings({ showToaster: false });
      toast.success(`Settings updated successfully`);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateDefaultPassword() {
    const payload = {
      UserId: agent.UserId,
      DefaultPassword: convertToMD5(defaultPassword),
    };

    try {
      setDefaultPasswordLoading(true);
      await updateDefaultPasswordApi(payload);
      fetchGlobalSettings({ showToaster: false });
      toast.success(`Default password updated successfully`);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setDefaultPasswordLoading(false);
    }
  }

  async function fetchGlobalSettings({ showToaster = false }) {
    try {
      const payload = { UserId: agent.UserId };
      const { Data: data, MetaData: metaData } =
        (await getGlobalSettingsApi(payload)) || {};
      setMetaData(metaData);
      form.reset({
        ...data,
        IsEmailReq: Boolean(data.IsEmailReq),
        ResetPreferredUsers: Boolean(data.ResetPreferredUsers),
        SameDayClientIdUpdate: Boolean(data.SameDayClientIdUpdate),
      });
      if (showToaster) toast.success(`Fetched settings successfully`);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGlobalSettings({ showToaster: false });
  }, []);

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

  if (!isGlobalSettingsReadAllowed) return null;

  let lastUpdatedDate = metaData?.LastUpdateDate
    ? format(new Date(Number(metaData?.LastUpdateDate) * 1000), "PPpp")
    : "";
  const lastUpdatedBy = metaData?.UpdatedBy ?? "";

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h1
            className={`text-3xl text-primary font-bold text-center md:text-left`}
          >
            Settings
          </h1>

          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent px-0 lg:px-1"
              onClick={() => fetchGlobalSettings({ showToaster: true })}
            >
              <RefreshCcw className="h-5 w-5 text-gray-900" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Password Expiration Days */}
                <FormField
                  control={form.control}
                  name="PWExpireDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Expiration (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Duration before passwords expire (Enter 0 to disable
                        this check)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Complete Task TTL */}
                <FormField
                  control={form.control}
                  name="TaskTTL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Retention (Weeks)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        How long to keep tasks after end time
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Default TPIN */}
                <FormField
                  control={form.control}
                  name="DefaultTPIN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default TPIN</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>4-digit default PIN</FormDescription>
                    </FormItem>
                  )}
                />

                {/* TE Report Retention Days */}
                <FormField
                  control={form.control}
                  name="TEReportRetentionDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TE Report Retention (Weeks)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        How long to keep Trade Exception reports
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Reset Preferred Users */}
                <FormField
                  control={form.control}
                  name="ResetPreferredUsers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Reset preferred Users
                        </FormLabel>
                        <FormDescription>
                          Enable to reset user preferences
                        </FormDescription>
                      </div>
                      <FormMessage />
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Is Email Required */}
                <FormField
                  control={form.control}
                  name="IsEmailReq"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Email Required
                        </FormLabel>
                        <FormDescription>
                          Require email addresses for users
                        </FormDescription>
                      </div>
                      <FormMessage />
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Same day client id update for remarks */}

                {/* TE Report Retention Days */}
                <FormField
                  control={form.control}
                  name="AllowedClientIdUpdateDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID Edit Window (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Number of days after the call when the client ID can
                        still be changed
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Auto call flag */}
                <FormField
                  control={form.control}
                  name="AutoCallFeature"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto call</FormLabel>
                        <FormDescription>
                          Auto call clients for scheduled followup calls
                        </FormDescription>
                      </div>
                      <FormMessage />
                      <FormControl>
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 0)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button disabled={loading} type="submit" className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Updating settings.." : "Save settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mt-12 max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Default Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(updateDefaultPassword)}
              className="space-y-6"
            >
              <div className="grid gap-4">
                {/* Default Password */}
                <FormField
                  control={form.control}
                  name="DefaultPW"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Password</FormLabel>
                      <FormControl className="flex">
                        <>
                          <Input
                            value={defaultPassword}
                            onChange={(e) => setDefaultPassword(e.target.value)}
                            // {...field}
                          />
                          <FormMessage />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={defaultPasswordloading}
                type="submit"
                className="w-full"
              >
                {defaultPasswordloading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {defaultPasswordloading
                  ? "Updating password.."
                  : "Save password"}
              </Button>
            </form>
          </Form>

          <div className="flex justify-end mt-4 text-sm">
            <span className="mr-2">Last updated at: {lastUpdatedDate}</span>
            <span>Last updated by: {lastUpdatedBy}</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
