import { toast } from "sonner";

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    toast.error("This browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast.error("Permission denied for notifications.");
  }
  return permission;
};
