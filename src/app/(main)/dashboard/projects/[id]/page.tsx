"use client";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  DraftingCompass,
  LucideEdit,
  LucideExternalLink,
  LucideGlobe,
  LucideGlobe2,
  LucideInfo,
  LucideLock,
  Trash2,
  GitPullRequest,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { InviteDialog } from "@/modules/projects/inviteDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

const ProjectPage = () => {
  const params = useParams<{ id: Id<"projects"> }>();

  const project = useQuery(api.projects.getProjectById, {
    projectId: params.id,
  });

  const membersData = useQuery(api.projects.getOwnerAndProjectMembers, {
    projectId: params.id,
  });
  const currentUser = useQuery(api.users.getCurrentUser);
  const removeMember = useMutation(api.projects.removeMember);

  // Checking for current user is Owner who is logged In....
  const isOwner =
    currentUser && membersData && currentUser._id === membersData.owner._id;

  const [inviteOpen, setInviteOpen] = useState(false);


  if (project === undefined) {
    return (
      <div className="p-6 h-full w-full flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl capitalize font-semibold  ">
          {project?.projectName}
        </h1>

        <div className="flex items-center gap-5">
          <div
            className={cn(
              "flex items-center gap-2 py-1 px-3 text-xs border rounded-full",
              project?.isPublic
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-orange-500 text-orange-600 bg-orange-50",
            )}
          >
            {project?.isPublic ? (
              <LucideGlobe className="w-4 h-4" />
            ) : (
              <LucideLock className="w-4 h-4" />
            )}

            <p>{project?.isPublic ? "Public" : "Private"}</p>
          </div>
          <Button
            className="text-xs cursor-pointer px-2!"
            size="sm"
            variant="outline"
            disabled={!isOwner}
          >
            Edit project <LucideEdit className="w-4 h-4 ml-1" />
          </Button>
          <Button
            className="text-xs cursor-pointer px-4!"
            size="sm"
            variant="outline"
            onClick={() => setInviteOpen(true)}
          >
            Invite Others <LucideExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* AWS PROJECT THUMBNAIL SETUP  1080 x 260 */}
      <div className="my-5 flex justify-center">
        <div className="w-[1080px] h-[260px] bg-gray-200 rounded"></div>
      </div>

      <div className="flex w-full items-center justify-center gap-20 mt-5">
      
        <Link href={`/dashboard/projects/${params.id}/canvas`}>
        
          <Button
            className="text-sm px-8!  cursor-pointer"
            size="sm"
            variant="outline"
          >
            Go to canvas <DraftingCompass className="w-4 h-4 ml-1" />
          </Button>
        </Link>

        <Link href={`/dashboard/projects/${params.id}/requests`}>
          <Button
            className="text-sm px-8!  cursor-pointer"
            size="sm"
            variant="outline"
          >
            Check requests <GitPullRequest className="w-4 h-4 ml-1" />
          </Button>
        </Link>
         
        <Link href={`/dashboard/projects/${params.id}/codespace`}>
          <Button
            className="text-sm px-5!  cursor-pointer"
            size="sm"
            variant="outline"
          >
            Go to codespace <LucideGlobe className="w-4 h-4 ml-1" />
          </Button>
        </Link>

        <Link href={`/dashboard/projects/${params.id}/group-chat`}>
          <Button
            className="text-sm px-5!  cursor-pointer"
            size="sm"
            variant="outline"
          >
            Group Chat <MessageSquare className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

        

      {/* PARENT CONATINER */}
      <div className="flex px-4 w-full mt-10 gap-6">
        {/* LEFT SIDE */}
        {/* Team Members Section */}
        <div className="w-[70%] h-full">
          <Card className="p-3! shadow-none border">
            <CardHeader>
              <CardTitle>
                <h2 className="text-xl font-medium font-pop text-center">
                  Team Members
                </h2>
              </CardTitle>
              <h3 className="text-muted-foreground text-sm text-center">
                Manage your Team efficiently
              </h3>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Owner */}
                {membersData?.owner && (
                  <div className="flex items-center justify-between p-2 rounded shadow">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={membersData.owner.imageUrl} />
                        <AvatarFallback>
                          {membersData.owner.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {membersData.owner.name}{" "}
                          <span className="text-xs text-muted-foreground ml-2 bg-secondary px-2 py-0.5 rounded-full">
                            Owner
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {membersData.owner.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members */}
                {membersData?.members?.map((member) => {
                  if (!member) return null;
                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-2 rounded shadow"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback>
                            {member.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            removeMember({
                              projectId: params.id,
                              memberId: member._id,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}

                {membersData?.members?.length === 0 && (
                  <div className="flex items-center justify-center my-4">
                    <p className="text-sm text-muted-foreground italic">
                      No Team Members Added yet !
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* RIGHT SIDE */}
        <Separator orientation="vertical" className="h-100!" />
        <div className="w-[30%] h-full flex flex-col  space-y-3">
          <h3 className="text-center">
            Project Details <LucideInfo className="w-4 h-4 ml-2 inline" />
          </h3>
          <p>
            Description:{" "}
            {project?.projectDescription ?? "No description added yet"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {project?.projectTags?.map((tag) => (
              <p
                key={tag}
                className="bg-muted py-1 px-3 rounded-full text-sm text-muted-foreground"
              >
                {tag}
              </p>
            ))}
          </div>
          <p>
            Created On:{" "}
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(project?.createdAt!)}
            </span>
          </p>
          <p>
            Updated On:{" "}
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(project?.updatedAt!)}
            </span>
          </p>
        </div>
      </div>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        inviteLink={project?.inviteLink!}
      />
    </div>
  );
};

export default ProjectPage;
