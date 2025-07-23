import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import logo from "/logo.svg";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { loginFormSchema } from "@/schemas/user";
import { loginApi } from "@/services/apiAuth";
import { convertToMD5 } from "@/lib/utils";
import { useChangePassword } from "@/hooks/useChangePassword";
import ChangePasswordModal from "@/components/ChangePassword";
import { useAxiosWithAuth } from "@/utils/apiClient";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setIsLoginAlertOpen } = useAuth();
  useAxiosWithAuth();

  const {
    login,
    isAuthenticated,
    lastSavedCredentials,
    setLastSavedCredentials,
  } = useAuth();
  const { onOpen: openChangePasswordModal, onClose: closeChangePasswordModal } =
    useChangePassword();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userId: lastSavedCredentials?.userId ?? "",
      password: lastSavedCredentials?.password ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    const payload = {
      userId: values.userId.trim(),
      password: convertToMD5(values.password),
    };

    try {
      setLoading(true);
      const { data, metaData } = await loginApi(payload);
      setLastSavedCredentials({
        userId: values.userId,
        password: values.password,
      });
      if (data.userData.PWExpireTime <= 3 && data.userData.PWExpireTime > 0) {
        setIsLoginAlertOpen(true);
        login(data, metaData);
        setTimeout(() => {
          toast.success(`Logged in successfully`);
          navigate("/dashboard");
        }, 500);
        return;
      } else if (data.userData.showChangePasswordPrompt) {
        if (data.userData?.PWExpireTime === 0) {
          toast.info("Your password has been expired, change your password");
          openChangePasswordModal();
          return;
        } else if (!data.userData.PWExpireTime) {
          toast.info("Change Your Password");
          openChangePasswordModal();
          return;
        }
      } else {
        setTimeout(() => {
          toast.success(`Logged in successfully`);
          navigate("/dashboard");
          closeChangePasswordModal();
        }, 500);
        login(data, metaData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/dashboard`);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (lastSavedCredentials) {
      form.setValue("userId", lastSavedCredentials?.userId);
      form.setValue("password", lastSavedCredentials?.password);
    }
  }, [lastSavedCredentials]);

  return (
    <div className="h-screen flex md:block flex-col items-center justify-center">
      <img className="w-20 mx-5  md:mt-5" src={logo} alt="Logo" />
      <div className="flex flex-col justify-between items-center mt-4 md:mt-32">
        <Card className="mx-2 lg:mx-auto max-w-sm border-2 border-[#0027341f] shadow-lg rounded-xl py-2 mb-32 md:mb-0">
          <CardHeader className="space-y-1 py-7">
            <CardTitle className="text-[25px] text-center md:text-start font-bold text-primary">
              Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
                autoComplete="on"
                name="login-form"
              >
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex md:block flex-col gap-2">
                        <FormLabel className="text-[14.5px] md:text-sm tracking-wider text-[#042a37] pl-1">
                          Agent ID
                        </FormLabel>
                        <FormControl className="flex">
                          <>
                            <Input
                              {...field}
                              placeholder="Your agent id"
                              autoFocus
                              name="username"
                              id="username"
                              autoComplete="username"
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
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="text-[14.5px] md:text-sm tracking-wider text-[#042a37] pl-1">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              placeholder="password here"
                              type={showPassword ? "text" : "password"}
                              required
                              autoComplete="current-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? (
                                <EyeIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              ) : (
                                <EyeOffIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full text-xl my-4"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Logging in.." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <ChangePasswordModal userId={form.getValues("userId")} />
      </div>
    </div>
  );
}

export default Login;
