"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import {
  Check,
  ChevronsUpDown,
  LucideActivity,
  LucideMoveRight,
  LucidePaintBucket,
  LucidePlus,
  LucideSquarePen,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AVAILABLE_TAGS } from "@/lib/Static-items";

const DashboardPage = () => {
  const user: Doc<"users"> | undefined | null = useQuery(
    api.users.getCurrentUser
  );

  const projects = useQuery(api.projects.getProjects);
  const createProject = useMutation(api.projects.createProject);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [openTagCombobox, setOpenTagCombobox] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const PROJECT_GRADIENTS = [
    "from-red-300 to-red-100",
    "from-green-300 to-green-100",
    "from-purple-300 to-purple-100",
    "from-rose-300 to-rose-100",
    "from-blue-300 to-blue-100",
    "from-orange-300 to-orange-100",
    "from-pink-300 to-pink-100",
    "from-yellow-300 to-yellow-100",
    "from-amber-300 to-amber-100",
    "from-teal-200/70 to-teal-100",
    "from-lime-200/70 to-lime-100",
    "from-indigo-200/70 to-indigo-100",
  ];

  const handleCreate = async () => {
    if (!user?._id || !projectName.trim()) return;

    setIsCreating(true);
    try {
      await createProject({
        name: projectName,
        tags: selectedTags,
        isPublic: isPublic,
        ownerId: user._id,
      });

      // Cleanup
      setIsCreateOpen(false);
      setProjectName("");
      setSelectedTags([]);
      setIsPublic(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="w-full h-full p-6">
      <h1 className="text-3xl font-semibold font-pop mb-10">
        Welcome to Looma, {user?.name || "User"}
      </h1>

      {/* -----------PROJECTS SECTION ---------- */}
      <div className="my-5 px-4 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold font-pop">
              My Workspaces <LucideActivity className="h-4 w-4 inline ml-1" />
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage your Projects with your team
            </p>
          </div>

          <div>
            <Button size="sm" variant="outline">
              View All Projects{" "}
              <LucideMoveRight className="h-4 w-4 inline ml-1" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 min-[1460px]:grid-cols-5 gap-5 mt-5">
          {/* Create New Project Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Card className="h-[180px] w-[220px] shrink-0 flex items-center justify-center border-2 border-dashed border-muted-foreground/40 hover:border-primary transition cursor-pointer hover:bg-muted/10">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LucidePlus className="h-4 w-4" /> Create New Project
                </span>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new project to collaborate with your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Tags</Label>
                  <Popover
                    open={openTagCombobox}
                    onOpenChange={setOpenTagCombobox}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTagCombobox}
                        className="w-full justify-between"
                      >
                        {selectedTags.length > 0
                          ? `${selectedTags.length} tags selected`
                          : "Select tags..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="center">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList className="h-64">
                          <CommandEmpty>No tag found.</CommandEmpty>
                          <CommandGroup>
                            {AVAILABLE_TAGS.map((tag) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={() => toggleTag(tag)}
                                className="p-1 text-sm"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTags.includes(tag)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="public-mode"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="public-mode">Make Public</Label>
                    <p className="text-xs text-muted-foreground">
                      Public projects are visible to everyone.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  disabled={!projectName || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Loading State or Project List */}
          {projects === undefined ? (
            // Skeleton Loading
            Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="h-[180px] w-[240px] shrink-0 p-3 overflow-hidden"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                </CardHeader>
                <CardContent className="mt-2">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                </CardContent>
                <CardFooter className="mt-2">
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </CardFooter>
              </Card>
            ))
          ) : projects?.length ? (
            projects.slice(0, 3).map((project, index) => {
              const gradient =
                PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];

              return (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                >
                  <Card
                    className={`h-[180px] w-[250px] shrink-0 bg-linear-to-br ${gradient} 
            hover:scale-[1.02] transition-transform cursor-pointer p-2! overflow-hidden`}
                  >
                    <CardHeader>
                      <h3 className="text-base font-semibold truncate capitalize text-center ">
                        {project.projectName}
                      </h3>
                    </CardHeader>
                    <CardContent className="-mt-4 relative">
                      <div className="w-22 h-22 bg-white/30 blur-in-3xl rounded-full mx-auto absolute left-1/2  -translate-x-1/2"></div>
                    </CardContent>
                    <CardFooter className="mt-auto p-0! mx-auto">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground tracking-tight">
                        <LucideSquarePen className="h-4 w-4" /> Updated:{"  "}
                        {formatDistanceToNow(new Date(project.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground col-span-4 py-8">
              No projects found. Create one to get started!
            </p>
          )}
        </div>
      </div>

      {/* -------------STYLE GUIDE SECTION--------------- */}
      <div className="px-4 space-y-1 mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold font-pop">
              Style Guide <LucidePaintBucket className="h-5 w-5 inline ml-1" />
            </h2>
            <p className="text-lg text-muted-foreground">
              Customize your workspace with your own colors, fonts.
            </p>
          </div>

          <div>
            <Button size="sm" variant="outline">
              View All Styles{" "}
              <LucideMoveRight className="h-4 w-4 inline ml-1" />
            </Button>
          </div>
        </div>

        <div>
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
