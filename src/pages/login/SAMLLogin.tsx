import logo from "/logo.svg";
import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { hasPrivilege, LOGIN_MODE } from "@/utils/privileges";
import { useQueryParams } from "@/hooks/useQueryParams";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function SAMLLogin() {
  const query = useQueryParams();
  const errQueryParam = query.get("err");
  const navigate = useNavigate();

  const handleSAMLLogin = () => {
    // Redirect to the backend endpoint that starts the SAML login flow
    window.location.href = `${window.APP_CONFIG.API_URL}/v1/auth/saml/login`;
  };

  const isSAMLLoginEnabled = hasPrivilege(
    window.APP_CONFIG.L_MODE,
    LOGIN_MODE.SAML
  );

  useEffect(() => {
    if (errQueryParam === "invalid_auth" && isSAMLLoginEnabled) {
      setTimeout(() => {
        toast.error("User not found");
        navigate(`/saml/login`);
      }, 0);
    }
  }, [errQueryParam, isSAMLLoginEnabled]);

  const APP_NAME = window.APP_CONFIG.APP_NAME;

  return (
    <div className="h-full">
      <img className="w-16 mx-5 mt-5" src={logo} alt="Logo" />
      <div className="flex flex-col justify-between items-center mt-16 md:mt-32">
        <Card className="mx-8 lg:mx-auto min-w-[360px] border-2 shadow-lg rounded-lg">
          <CardHeader className="space-y-1 max-w-[420px]">
            <CardTitle className="text-2xl font-bold text-primary">
              {APP_NAME}
            </CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSAMLLogin}
              type="submit"
              className="w-full text-lg"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SAMLLogin;
