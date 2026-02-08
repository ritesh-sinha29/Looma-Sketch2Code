"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { VersionManager } from "@/modules/projects/diffing-system";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const RequestsPage = () => {
  const params = useParams<{ id: Id<"projects"> }>();
  
  const project = useQuery(api.projects.getProjectById, {
    projectId: params.id,
  });

  const membersData = useQuery(api.projects.getOwnerAndProjectMembers, {
    projectId: params.id,
  });
  
  const currentUser = useQuery(api.users.getCurrentUser);

  // Checking for current user is Owner
  const isOwner =
    currentUser && membersData && currentUser._id === membersData.owner._id;

  if (project === undefined || membersData === undefined || currentUser === undefined) {
    return (
      <div className="p-6 h-full w-full flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Change Requests & History</h1>
          <p className="text-sm text-muted-foreground">
            Manage version control for {project?.projectName}
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <VersionManager projectId={params.id} isOwner={!!isOwner} />
      </div>
    </div>
  );
};

export default RequestsPage;
