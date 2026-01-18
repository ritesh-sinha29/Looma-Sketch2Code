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
import { Doc } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AppWindow,
  ChevronsUpDown,
  FolderCode,
  Github,
  LucideApple,
  LucideLayoutDashboard,
  LucidePaintBucket,
  LucideRocket,
  LucideSettings,
  Plus,
  SparklesIcon,
  User,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignOutButton } from "@clerk/clerk-react";
import { Progress } from "@/components/ui/progress";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const user: Doc<"users"> | undefined | null = useQuery(
    api.users.getCurrentUser
  );

  if (user === null) return null;

  const projects = useQuery(api.projects.getProjects);
  const joinedProjects = useQuery(api.projects.getMemberProjects);

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
          <div className="flex items-center gap-4 my-0.5 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md group-data-[collapsible=icon]:hidden overflow-hidden">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5 group-data-[collapsible=icon]:hidden">
              <h2 className="flex gap-2 text-sm items-center truncate max-w-[130px]">
                <User className="h-4 w-4" /> {user?.name}
              </h2>
              <p className="text-xs text-muted-foreground ml-3">
                Account Connected
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-5 px-1 space-y-0">
        {/* Dashboard */}
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard")}
          className="group relative overflow-hidden"
        >
          <Link
            href="/dashboard"
            className="relative z-10 flex items-center gap-3 px-3 py-4.5! data-[active=true]:text-black text-muted-foreground"
          >
            <LucideLayoutDashboard className="h-5 w-5" />
            <span className="text-base">Dashboard</span>

            {/* Gradient Active Indicator */}
            <span
              className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/50 to-blue-100
      "
            />
          </Link>
        </SidebarMenuButton>
        {/* Projects */}
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard/projects")}
          className="group relative overflow-hidden"
        >
          <Link
            href="/dashboard/projects"
            className="relative z-10 flex items-center gap-3 px-3 py-4.5! data-[active=true]:text-black text-muted-foreground"
          >
            <AppWindow className="h-5 w-5" />
            <span className="text-base">Projects</span>

            {/* Gradient Active Indicator */}
            <span
              className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/50 to-blue-100
      "
            />
          </Link>
        </SidebarMenuButton>
        {/* Style Guide */}
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard/style-guide")}
          className="group relative overflow-hidden"
        >
          <Link
            href="/dashboard/style-guide"
            className="relative z-10 flex items-center gap-3 px-3 py-4.5! data-[active=true]:text-black text-muted-foreground"
          >
            <LucidePaintBucket className="h-5 w-5" />
            <span className="text-base">Style Guide</span>

            {/* Gradient Active Indicator */}
            <span
              className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/50 to-blue-100
      "
            />
          </Link>
        </SidebarMenuButton>
        {/* Discover */}
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard/discover")}
          className="group relative overflow-hidden"
        >
          <Link
            href="/dashboard/discover"
            className="relative z-10 flex items-center gap-3 px-3 py-4.5! data-[active=true]:text-black text-muted-foreground"
          >
            <LucideRocket className="h-5 w-5" />
            <span className="text-base">Discover</span>

            {/* Gradient Active Indicator */}
            <span
              className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/50 to-blue-100
      "
            />
          </Link>
        </SidebarMenuButton>

        {/* MY PROJECTS WITH 2 TABS  MY CREATION | Team PROJECT*/}
        <div className="px-1 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-center gap-2">
            <span className="w-10 h-px bg-muted-foreground/30"></span>
            <h3 className="mb-2 text-base font-semibold text-muted-foreground capitalize text-center">
              My Projects
            </h3>
            <span className="w-10 h-px bg-muted-foreground/30"></span>
          </div>

          <Tabs defaultValue="my" className="w-full">
            <TabsList className="grid grid-cols-2 h-8 mx-auto w-full">
              <TabsTrigger value="my" className="text-xs">
                My Creations
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs">
                Team Projects
              </TabsTrigger>
            </TabsList>

            {/* FIXED HEIGHT + SCROLL */}
            <div className="mt-2 p-1 h-[156px] overflow-y-auto rounded-md border bg-sidebar-accent/30">
              {/* MY CREATIONS */}
              <TabsContent value="my" className="m-0 p-2">
                {projects && projects.length === 0 ? (
                  <div className="">
                    <p>No projects found!</p>
                    <div className="flex items-center justify-center">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Create Project
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 ">
                    {projects?.map((project) => (
                      <div key={project._id}>
                        <div className="flex items-center text-xs tracking-tight hover:bg-accent hover:p-1 rounded-md transition-all duration-150">
                          <Link
                            className="flex items-center gap-2 truncate w-full max-w-[160px]"
                            href={`/dashboard/projects/${project._id}`}
                          >
                            <FolderCode className="h-4 w-4 mr-1" />
                            <p>{project.projectName}</p>
                          </Link>
                        </div>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Project
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* TEAM PROJECTS */}
              <TabsContent value="team" className="m-0 p-2">
                <div className="flex h-full flex-col gap-2 text-center">
                  {joinedProjects && joinedProjects.length === 0 ? (
                    <>
                      <Users className="h-5 w-5 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground">
                        No team projects
                      </p>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Collab Now
                      </Button>
                    </>
                  ): (
                    <div className="flex flex-col gap-2 ">
                      {joinedProjects?.map((joined) => (
                        <div key={joined._id}>
                          <div className="flex text-xs tracking-tight hover:p-1 hover:bg-accent/30 duration-200">
                            <Link
                              className="flex items-center gap-2 truncate w-full max-w-[160px]"
                              href={`/dashboard/projects/${joined._id}`}
                            >
                              <FolderCode className="h-4 w-4 mr-1" />
                              <p>{joined.projectName}</p>
                            </Link>
                          </div>
                        </div>
                      ))} </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        {/* Settings */}
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard/settings")}
          className="group relative overflow-hidden"
        >
          <Link
            href="/dashboard/settings"
            className="relative z-10 flex items-center gap-3 px-3 py-2 data-[active=true]:text-black text-muted-foreground"
          >
            <LucideSettings className="h-5 w-5" />
            <span className="text-base">Settings</span>

            {/* Gradient Active Indicator */}
            <span
              className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/50 to-blue-100
      "
            />
          </Link>
        </SidebarMenuButton>

        {/* <SignOutButton redirectUrl="/auth">
          <Button variant="outline">Sign Out</Button>
        </SignOutButton> */}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t px-2 py-2 group-data-[collapsible=icon]:hidden">
        <div className="rounded-md bg-linear-to-br from-blue-600/30 via-indigo-400/30 to-transparent px-3 py-3 space-y-3 ">
          {/* TOP MESSAGE (only if NOT elite) */}
          {user?.type !== "elite" && (
            <div className="flex items-start gap-2">
              <SparklesIcon className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm leading-snug">
                <p className="font-medium text-foreground">
                  Boost productivity with AI
                </p>
                {/* <p className="text-muted-foreground text-sm italic">
                  Understand projects much faster with Elite.
                </p> */}
              </div>
            </div>
          )}

          {/* USAGE */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="capitalize">{user?.type} tier</span>
              <span>1 / {user?.limit}</span>
            </div>

            <Progress
              value={Math.min((1 / (user?.limit ?? 1)) * 100, 100)}
              className="h-1.5"
            />
          </div>

          {/* CTA */}
          {user?.type !== "elite" && (
            <Button size="sm" variant="default" className="w-full text-xs h-8">
              Upgrade now
            </Button>
          )}

          {/* ELITE STATE */}
          {user?.type === "elite" && (
            <p className="text-xs text-muted-foreground text-center">
              You’re on{" "}
              <span className="font-medium text-foreground">Elite</span> 🚀
            </p>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
