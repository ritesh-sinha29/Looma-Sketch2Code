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
  LucideEdit,
  LucideExternalLink,
  LucideGlobe,
  LucideLock,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { InviteDialog } from "@/modules/projects/inviteDialog";

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
                : "border-orange-500 text-orange-600 bg-orange-50"
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

      <Link href={`/dashboard/projects/${params.id}/canvas`}>
        <Button className="text-sm mt-5 cursor-pointer" size="sm">
          Go to canvas
        </Button>
      </Link>
      <p className="mt-5">below will be saved canvas </p>
      <p>below of that , will be code generated for particular canvas!</p>

      {/* Team Members Section */}
      <div className="mt-8 border-t pt-6 max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>

        <div className="grid gap-4">
          {/* Owner */}
          {membersData?.owner && (
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
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
                className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
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
            <p className="text-sm text-muted-foreground italic">
              No other members in this project.
            </p>
          )}
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
