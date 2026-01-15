"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Doc } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronsUpDown,
  FolderCode,
  Github,
  LucideApple,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignOutButton } from "@clerk/clerk-react";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const user: Doc<"users"> | undefined | null = useQuery(
    api.users.getCurrentUser
  );

  if (user === null) return null;

  const projects = useQuery(api.projects.getProjects);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashbaord");
  };

  return (
    <Sidebar collapsible="icon" className="cursor-move">
      <SidebarHeader className="border-b ">
        <div className="flex items-center justify-between px-3 py-3">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={30}
            height={30}
            className="cursor-pointer"
          />
          <h1 className="font-bold font-pop text-2xl group-data-[collapsible=icon]:hidden">
            Looma
          </h1>
          {/* DROPDOWN ICON TO CHOOSE AMON USER CREATED PROJECTS  */}
          <Popover>
            {/* Trigger */}
            <PopoverTrigger asChild>
              <Button
                size="icon-sm"
                variant="outline"
                className="cursor-pointer group-data-[collapsible=icon]:hidden"
              >
                <ChevronsUpDown className="h-5 w-5" />
              </Button>
            </PopoverTrigger>

            {/* Content */}
            <PopoverContent
              side="bottom"
              align="start"
              className="w-56 p-2  border-2 "
            >
              <p className="text-sm text-center font-semibold text-muted-foreground mb-2">
                Your Projects
              </p>
              <Separator className="my-2" />
              <div className="flex flex-col gap-1">
                {projects?.length ? (
                  projects.map((project) => (
                    <Link
                      key={project._id}
                      href={`/dashboard/my-projects/${project._id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition"
                    >
                      <FolderCode className="h-4 w-4 shrink-0" />
                      <span className="truncate">{project.projectName}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2">
                    No projects found
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {/* SHOWING GITHUB CONNECTED ACCOUNT */}
        {user === undefined ? (
          <div className="flex items-center gap-4 my-1 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md w-full">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col space-y-2 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 my-0.5 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md group-data-[collapsible=icon]:hidden">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5 group-data-[collapsible=icon]:hidden">
              <h2 className="flex gap-2 text-sm items-center truncate">
                <User className="h-4 w-4" /> {user?.name}
              </h2>
              <p className="text-xs text-muted-foreground ml-3">
                Account Connected
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard/projects")}
          className="group relative overflow-hidden"
        >
          <Link
            href="/dashboard/projects"
            className="relative z-10 flex items-center gap-3 px-3 py-2 data-[active=true]:text-white text-muted-foreground"
          >
            <LucideApple className="h-5 w-5" />
            <span className="text-base">Projects</span>

            {/* Gradient Active Indicator */}
            <span
              className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/50 via-transparent  to-transparent
      "
            />
          </Link>
        </SidebarMenuButton>
        <SignOutButton redirectUrl="/auth">
          <Button variant="outline">Sign Out</Button>
        </SignOutButton>
      </SidebarContent>
    </Sidebar>
  );
};
