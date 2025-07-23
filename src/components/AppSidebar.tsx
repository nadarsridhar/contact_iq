import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Settings, PlayCircle, FileText, Box, Users, BarChart2, Briefcase } from "lucide-react";

interface SidebarItem {
  title: string;
  url?: string;
  icon?: React.ReactNode;
  items?: {
    title: string;
    url: string;
  }[];
}

const platformItems: SidebarItem[] = [
  {
    title: "Playground",
    icon: <PlayCircle className="h-4 w-4" />,
    items: [
      { title: "History", url: "/playground/history" },
      { title: "Starred", url: "/playground/starred" },
      { title: "Settings", url: "/playground/settings" },
    ],
  },
  {
    title: "Models",
    icon: <Box className="h-4 w-4" />,
    url: "/models",
  },
  {
    title: "Documentation",
    icon: <FileText className="h-4 w-4" />,
    url: "/documentation",
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    url: "/settings",
  },
];

const projectItems: SidebarItem[] = [
  {
    title: "Design Engineering",
    icon: <Users className="h-4 w-4" />,
    url: "/design",
  },
  {
    title: "Sales & Marketing",
    icon: <BarChart2 className="h-4 w-4" />,
    url: "/sales",
  },
  {
    title: "Travel",
    icon: <Briefcase className="h-4 w-4" />,
    url: "/travel",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, setOpen } = useSidebar();

  const handleSidebarClose = () => {
    setOpenMobile(false);
    setOpen(false);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-0 flex w-full items-center p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary"></div>
          <div className="flex flex-col">
            <span className="font-semibold">Acme Inc</span>
            <span className="text-xs text-muted-foreground">Enterprise</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Platform</h2>
            {platformItems.map((item) => (
              <SidebarGroup key={item.title} onClick={handleSidebarClose}>
                <SidebarGroupLabel className="flex items-center gap-2 px-2">
                  {item.icon}
                  {item.url ? (
                    <Link to={item.url} className="flex-1">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="flex-1">{item.title}</span>
                  )}
                </SidebarGroupLabel>
                {item.items && (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild className="pl-8">
                            <Link to={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            ))}
          </div>

          <div>
            <SidebarSeparator />
            <h2 className="mb-2 mt-4 px-2 text-xs font-semibold tracking-tight">Projects</h2>
            {projectItems.map((item) => (
              <SidebarGroup key={item.title} onClick={handleSidebarClose}>
                <SidebarGroupLabel className="flex items-center gap-2 px-2">
                  {item.icon}
                  {item.url ? (
                    <Link to={item.url} className="flex-1">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="flex-1">{item.title}</span>
                  )}
                </SidebarGroupLabel>
              </SidebarGroup>
            ))}
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
} 