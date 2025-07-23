import { useState } from "react";
import { KeyRound, LogOut, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileDetailsModal } from "@/hooks/useProfileDetailsModal";
import { useIsMobile } from "@/hooks";
import { useChangePassword } from "@/hooks/useChangePassword";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useSIPProvider } from "./SipProvider";
import { useProfileContext } from "@/contexts/ProfileContext";
import { hasPrivilege, LOGIN_MODE } from "@/utils/privileges";
import { trimString } from "@/lib/utils";
import { useApiKeysModal } from "@/hooks/useApiKeysModal";

export default function UserNav() {
  const [open, setOpen] = useState(false);
  const { agent, logout, hasSuperAdminPrivilege, isBranchAdmin, isSuperAdmin } =
    useAuth();
  const { sessionManager } = useSIPProvider();
  const { isChangePassordAllowed, isPhoneNumberAllowed } = usePrivilege();

  const { onOpen: handleProfileModalOpen } = useProfileDetailsModal();
  const { onOpen: openChangePasswordModal } = useChangePassword();
  const { onOpen: openApiKeyModal } = useApiKeysModal();
  const { refAudioRemote } = useProfileContext();
  const isMobile = useIsMobile();

  const AUTH_MODE = window.APP_CONFIG.L_MODE;
  const isSAMLLoginEnabled = hasPrivilege(AUTH_MODE, LOGIN_MODE.SAML);

  const handleLogout = async () => {
    try {
      refAudioRemote.current = null;
      // Disconnect and unregister WebRTC
      await sessionManager?.unregister();
      await sessionManager?.disconnect();

      await logout();
      toast.success(`Logged out successfully`);
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    }
  };

  const handleChangePassword = () => {
    openChangePasswordModal();
  };

  const isGenerateApiKeysFeatureEnabled = window?.APP_CONFIG?.E_KEYS ?? false;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage alt={agent?.UserName} className="rounded-full" />
            <AvatarFallback className="border-2  bg-primary text-gray-100">
              {agent?.UserName?.split(" ")
                ?.map((n) => n[0])
                ?.join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-68 py-4 px-2.5 md:w-56"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xl md:text-sm font-medium leading-none">
              {trimString(agent?.UserName, 20)}
            </p>
            {isPhoneNumberAllowed && (
              <p className="text-[15px] md:text-xs  leading-none text-muted-foreground">
                Phone number: {agent?.UserMobileNumber}
              </p>
            )}
            <p className="text-[15px] md:text-xs leading-none text-muted-foreground">
              Agent ID: {agent?.UserId}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isMobile && !(hasSuperAdminPrivilege || isBranchAdmin) && (
          <DropdownMenuItem
            onClick={handleProfileModalOpen}
            className="cursor-pointer"
          >
            <UserIcon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        )}

        {isChangePassordAllowed && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleChangePassword}
          >
            <KeyRound className="mr-2 h-5 w-5 md:h-4 md:w-4" />
            <span className="text-lg md:text-sm">Change Password</span>
          </DropdownMenuItem>
        )}

        {isSuperAdmin && isGenerateApiKeysFeatureEnabled && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={openApiKeyModal}
          >
            <KeyRound className="mr-2 h-5 w-5 md:h-4 md:w-4" />
            <span className="text-lg md:text-sm">API Keys</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <LogOut className="mr-2 h-5 w-5 md:h-4 md:w-4" />
          <span className="text-lg md:text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
