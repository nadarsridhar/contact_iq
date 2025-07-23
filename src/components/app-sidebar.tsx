import * as React from "react";
import logo from "/logo.svg";
import ArrowUp from "../../public/SVGs/arrowUp.svg";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, open, setOpen, openMobile } = useSidebar();
  const { allowedLinks } = usePrivilege();
  const [hoveredItemTop, setHoveredItemTop] = React.useState(0);
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const handleSidebarClose = () => {
    setOpenMobile(false);
    setOpen(false);
  };

  const handleItemHover = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredItemTop(rect.top);
  };

  const handleNavigateClick = (url: string) => () => {
    if (url) {
      navigate(url);
      handleSidebarClose();
    }
  };

  const toggleCollapsible = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-0 flex w-full ">
        <div className={`w-full flex items-center justify-start p-[4px] `}>
          <img
            className="w-16 pt-4 ml-2 md:w-20 md:pt-0 md:ml-0  "
            src={logo}
            alt="Logo"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {allowedLinks.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            open={openItems[item.title]}
            onOpenChange={() => toggleCollapsible(item.title)}
            className="group/collapsible relative group/item cursor-pointer"
            onMouseEnter={handleItemHover}
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label border border-[#0038740c] md:border-none text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger
                  onClick={handleNavigateClick(item.url)}
                  className="w-full md:w-48 py-6"
                >
                  <div className="">
                    <img
                      className="w-8 md:w-7 pl-0.5 "
                      src={item.icon}
                      alt=""
                    />
                    {item.items.length > 0 && !open && !openMobile && (
                      <div
                        className="hidden group-hover/item:block fixed left-[32px] pl-4 z-[100]"
                        style={{ top: `${hoveredItemTop}px` }}
                      >
                        <div className=" bg-white px-2 rounded-lg shadow-lg border border-gray-200 py-2">
                          <div className="py-1">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.title}
                                to={subItem.url}
                                onClick={handleSidebarClose}
                                className="text-[13px] hover:no-underline px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary flex items-start pl-5"
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {item.url ? (
                    <div
                      onClick={handleSidebarClose}
                      className={` ${
                        open || openMobile ? "block" : "hidden"
                      } ml-2.5 hover:text-primary text-lg md:text-[12px]`}
                    >
                      {item.title}
                    </div>
                  ) : open || openMobile ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="ml-2.5 hover:text-primary text-lg md:text-[12px]">
                        {item.title}
                      </span>
                      <img
                        className={`w-6 h-6 transition-transform duration-200 ${
                          openItems[item.title] ? "rotate-180" : ""
                        }`}
                        src={ArrowUp}
                        alt=""
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {(open || openMobile) &&
                      item.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            className="hover:text-primary pl-4 pt-4"
                            asChild
                            isActive={item.isActive}
                          >
                            <Link
                              className="text-[17.5px] md:text-[11px] hover:no-underline"
                              onClick={handleSidebarClose}
                              to={item.url}
                            >
                              <span>
                                <img
                                  className="rotate-90 w-5 h-5"
                                  src={ArrowUp}
                                  alt=""
                                />
                              </span>{" "}
                              {item.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
