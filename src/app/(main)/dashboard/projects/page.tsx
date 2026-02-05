"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import {
  LucideLayoutGrid,
  LucideList,
  LucideSearch,
  LucideSortAsc,
  LucideSortDesc,
  LucideSquarePen,
  LucideUsers,
  LucidePlus,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PROJECT_GRADIENTS = [
  "from-red-300 to-red-100",
  "from-green-300 to-green-100",
  "from-purple-300 to-purple-100",
  "from-rose-300 to-rose-100",
  "from-blue-300 to-blue-100",
  "from-orange-300 to-orange-100",
  "from-pink-300 to-pink-100",
  "from-yellow-300 to-yellow-100",
];

const AllProjects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const ownedProjects = useQuery(api.projects.getProjects);
  const joinedProjects = useQuery(api.projects.getMemberProjects);

  const sortProjects = (projects: Doc<"projects">[] | undefined) => {
    if (!projects) return [];
    return [...projects]
      .filter((p) =>
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === "desc") {
          return b.updatedAt - a.updatedAt;
        }
        return a.updatedAt - b.updatedAt;
      });
  };

  const filteredOwned = sortProjects(ownedProjects);
  const filteredJoined = sortProjects(joinedProjects);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="h-[200px] animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-1/2" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and collaborate on all your creative workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-[400px]">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={`Sort by updated date (${
              sortOrder === "asc" ? "Ascending" : "Descending"
            })`}
          >
            {sortOrder === "desc" ? (
              <LucideSortDesc className="h-4 w-4" />
            ) : (
              <LucideSortAsc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Owned Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LucideLayoutGrid className="h-5 w-5 " />
            Owned Projects
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredOwned.length})
            </span>
          </h2>
        </div>

        {ownedProjects === undefined ? (
          <LoadingSkeleton />
        ) : filteredOwned.length > 0 ? (
          <div className="grid grid-cols-1  md:grid-cols-4 gap-6">
            {filteredOwned.map((project, index) => {
              const gradient =
                PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];
              return (
                <ProjectCard
                  key={project._id}
                  project={project}
                  gradient={gradient}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
              <LucidePlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No owned projects found.
            </p>
            <Link href="/dashboard" className="mt-4">
              <Button size="sm">Create your first project</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Joined Projects Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between ">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LucideUsers className="h-5 w-5 " />
            Team Member Projects
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredJoined.length})
            </span>
          </h2>
        </div>

        {joinedProjects === undefined ? (
          <LoadingSkeleton />
        ) : filteredJoined.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredJoined.map((project, index) => {
              const gradient =
                PROJECT_GRADIENTS[(index + 4) % PROJECT_GRADIENTS.length];
              return (
                <ProjectCard
                  key={project._id}
                  project={project}
                  gradient={gradient}
                  isMember
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed text-center">
            <div className="bg-background p-3 rounded-full shadow-sm mb-4">
              <LucideUsers className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              You haven't joined any other projects yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1 px-4">
              Ask your team for an invite link to collaborate!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

// ... inside the component or outside
interface ProjectCardProps {
  project: Doc<"projects">;
  gradient: string;
  isMember?: boolean;
}

const ProjectCard = ({ project, gradient, isMember }: ProjectCardProps) => {
  return (
    <Link href={`/dashboard/projects/${project._id}`}>
      <Card
        className={cn(
          "group h-[180px] relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-none cursor-pointer",
          `bg-linear-to-br ${gradient}`
        )}
      >
        <CardHeader className="relative z-10">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold truncate capitalize -mt-3 ">
              {project.projectName}
            </h3>
            {/* {isMember && (
              <div className="bg-white/40 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-foreground/70 uppercase tracking-wider">
                Team
              </div>
            )} */}
          </div>
        </CardHeader>

        <CardContent className="-mt-5">
          <div className="w-24 h-24 bg-muted/30 rounded-full mx-auto "></div>
        </CardContent>

        <CardFooter className="absolute bottom-0 left-0 right-0 p-3! bg-black/5 backdrop-blur-xs border-t border-white/10 flex justify-between items-center transition-colors group-hover:bg-black/10">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/60">
            <LucideSquarePen className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(project.updatedAt), {
              addSuffix: true,
            })}
          </p>
          <div className="flex items-center -space-x-2">
                        {project.projectMembers?.slice(0, 3).map((member) => (
                          <Avatar
                            key={member.userId}
                            className="w-8 h-8 border border-white/20"
                          >
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                        ))}

                        {project.projectMembers &&
                          project.projectMembers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-white/50 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                              +{project.projectMembers.length - 3}
                            </div>
                          )}
                      </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AllProjects;
