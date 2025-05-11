"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, LayoutDashboard, Settings, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar hook

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tooltip: "Dashboard" },
  // Add more navigation items here if needed
  // { href: "/settings", label: "Settings", icon: Settings, tooltip: "Settings" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" defaultOpen={true}>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <ListChecks className="h-7 w-7 text-primary" />
          <span className={cn("duration-200", sidebarState === "collapsed" && !isMobile && "opacity-0 w-0 hidden")}>TaskTicker</span>
        </Link>
        {!isMobile && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.tooltip, side: "right", align: "center" }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className={cn("duration-200", sidebarState === "collapsed" && !isMobile && "opacity-0 w-0 hidden")}>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* Placeholder for potential footer items like quick add task */}
        {/* <Button variant="outline" className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className={cn(sidebarState === "collapsed" && !isMobile && "opacity-0 w-0 hidden")}>New Task</span>
        </Button> */}
      </SidebarFooter>
    </Sidebar>
  );
}
