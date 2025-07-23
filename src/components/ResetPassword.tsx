import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Modal from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { getUsersApi, resetUserPasswordApi } from "@/services/apiUser";
import { Button } from "./ui/button";
import { convertToMD5 } from "@/lib/utils";
import { useResetPassword } from "@/hooks/useResetPassword";
import { userResetPasswordSchema } from "@/schemas/userPasswordReset";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "./ui/combobox";
import { IGetUserRequestPayload } from "@/utils/interfaces";
import globalState from "@/utils/globalState";

const RECORDS_PER_PAGE = 10;

function ResetPasswordModal() {
  const [isLoading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const { isOpen, onClose: closeModal } = useResetPassword();
  const { agent } = useAuth();

  const form = useForm<z.infer<typeof userResetPasswordSchema>>({
    resolver: zodResolver(userResetPasswordSchema),
    defaultValues: {
      UserId: "",
      Password: "",
    },
  });

  function handleReset() {
    form.reset();
    setSearchText("");
    setUsers([]);
  }

  async function onSubmit(payload: z.infer<typeof userResetPasswordSchema>) {
    try {
      setLoading(true);
      payload["Password"] = convertToMD5(payload.Password);
      payload["LoginId"] = agent.UserId;

      await resetUserPasswordApi(payload);
      toast.success(`Password changed successfully`);
      handleReset();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers(payload: IGetUserRequestPayload) {
    try {
      const { Data: data, MetaData: metaData } = await getUsersApi(payload);
      setUsers(data);
    } catch (error) {
    } finally {
    }
  }

  useEffect(() => {
    const payload = {
      LoginId: agent.UserId,
      UserCategory: -1,
      RecordsPerPage: RECORDS_PER_PAGE,
      SearchText: searchText,
      StartIndex: 0,
      UserId: "",
      BranchName: "",
    };

    const handler = setTimeout(() => fetchUsers(payload), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const comboboxData = users?.map((user) => ({
    label: user.UserId,
    value: user.UserId,
  }));

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onClose={closeModal}
      title={"Change password"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6 space-y-2">
            <FormField
              control={form.control}
              name="UserId"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>{globalState.AGENT_NAME} ID</FormLabel>
                    <FormControl className="flex">
                      <div className="mt-1">
                        <Combobox
                          disabled={false}
                          data={comboboxData}
                          label="user id"
                          setValue={form.setValue}
                          getValues={() => form.getValues(field.name)}
                          setSearchText={setSearchText}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="Password"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl className="flex">
                      <div className="relative w-full">
                        <Input
                          {...field}
                          className="w-full"
                          onChange={(e) =>
                            form.setValue(field.name, e.target.value)
                          }
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password.."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOffIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Saving.." : "Save"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}

export default ResetPasswordModal;
