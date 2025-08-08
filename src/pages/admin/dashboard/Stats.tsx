import LiveIcon from "@/components/icons/LiveIcon";
import { TotalDuration } from "@/components/icons/SvgIcons";
import { Phone, PhoneIncoming, PhoneOutgoing, Rss } from "lucide-react";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { formatDurationStats } from "@/utils/dateHelpers";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatsCardProps {
  title: string;
  value: number | string;
  Pvalue: number | string;
  Tvalue: number | string;
  icon: React.ReactNode;
  hasPrivilege?: boolean;
  color?: string;
}

function Stats({ stats, dateRange }) {
  const IsToday =
    dateRange !== null &&
    dateRange?.length > 0 &&
    dateRange[0].toLocaleDateString() === new Date().toLocaleDateString();
  const { isSuperAdmin, isBranchAdmin } = useAuth();

  const { isCallStatsAllowed, isChannelStatsAllowed } = usePrivilege();
   const isMobile = useIsMobile();

  const statsArray: StatsCardProps[] = [
    {
      title: "Total Calls",
      value: stats?.TotalCalls ?? 0,
      Pvalue: "",
      Tvalue: "",
      icon: <Phone className="text-blue-700" size={25} />,
      hasPrivilege: isCallStatsAllowed,
      color: "blue",
    },

    {
      title: "Calls (Active / Peak)",
      value: stats?.ActiveCalls ?? 0,
      icon: <LiveIcon/>,
      Pvalue: stats?.PeakCalls ?? 0,
      Tvalue: stats?.PeakCallTime
        ? new Date(stats.PeakCallTime * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "", 
      hasPrivilege: isCallStatsAllowed && (isSuperAdmin || isBranchAdmin),
      color: "red",
    },

    {
      title: "Incoming Calls",
      value: stats?.IncomingCalls ?? 0,
      Pvalue: "",
      Tvalue: "",
      icon: <PhoneIncoming className="text-green-700" size={25} />,
      hasPrivilege: isCallStatsAllowed,
      color: "green",
    },

    {
      title: "Outgoing Calls",
      value: stats?.OutgoingCalls ?? 0,
      Pvalue: "",
      Tvalue: "",
      icon: <PhoneOutgoing className="text-orange-700" size={25} />,
      hasPrivilege: isCallStatsAllowed,
      color: "orange",
    },
    {
      title: "Total Duration",
      value: stats?.TotalCallDuration
        ? formatDurationStats(stats?.TotalCallDuration)
        : 0,
      Pvalue: "",
      Tvalue: "",
      icon: <TotalDuration className="text-purple-700" size={25} />,
      hasPrivilege: isCallStatsAllowed,
      color: "purple",
    },
    {
      title:"Channels (Active / Peak)",
      value: stats?.ActiveChannel ?? 0,
      Pvalue: stats?.PeakChannel ?? 0,
      Tvalue: stats?.PeakChannelTime
        ? new Date(stats.PeakChannelTime * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "",
      icon: <Rss className="text-yellow-700" size={25} />,
      hasPrivilege: isChannelStatsAllowed,
      color: "yellow",
    },
  ];

  const colorMap = {
    red: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      fromTo: "from-red-100 to-red-300",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      fromTo: "from-blue-100 to-blue-300",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      fromTo: "from-green-100 to-green-300",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-500",
      text: "text-orange-800",
      fromTo: "from-orange-100 to-orange-300",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-500",
      text: "text-purple-800",
      fromTo: "from-purple-100 to-purple-300",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      fromTo: "from-yellow-100 to-yellow-300",
    },
  };

  return (
    <div className="p-2">
    <div className="grid gap-3 w-full whitespace-nowrap grid-cols-1 xs:grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
      {statsArray
        .filter((stat) => stat.hasPrivilege)
        .map(
          ({ title, icon, value, Pvalue, Tvalue, color }: StatsCardProps) => (
            <Card
              className={`border-0 border-l-4 ${colorMap[color].bg} shadow-lg bg-gradient-to-br ${colorMap[color].fromTo}`}
            >
              <CardContent className="p-5 ">
                <div className="flex items-end justify-between">
                  <div className="flex-col">
                    <p
                      className={`text-2xl font-semibold lg:text-base lg:font-semibold ${colorMap[color].text}`}
                    >
                      {title}
                    </p>
                    <p
                      className={`flex text-3xl font-bold ${colorMap[color].text}`}
                    >
                      {value}
                      {IsToday && Pvalue && (
                        <>
                          <div>&nbsp;/&nbsp;{Pvalue ?? ""}</div>

                          <Tooltip>
                            <TooltipTrigger>
                              <div className="text-sm font-normal mt-2 ml-2">
                                ({Tvalue})
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {title === "Channels (Active / Peak)"
                                ? "Peak Channel Time"
                                : title === "Calls (Active / Peak)" &&
                                  "Peak Call Time"}
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="p-2  rounded-lg">{icon}</div>
                </div>
              </CardContent>
            </Card>
          )
        )}
        </div>
    </div>
  );
}

export default Stats;
