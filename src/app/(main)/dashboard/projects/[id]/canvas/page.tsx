"use client";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import Canvas from "./Canvas";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
// import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

const ProjectCanvas = () => {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const projectId = params.id as Id<"projects">;


  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <Spinner className="size-10" />
        <p className="text-sm text-muted-foreground mt-2">
          Loading Amazing Experience With Leemo...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Please sign in
      </div>
    );
  }

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={projectId}
        initialPresence={{
          cursor: {
            x: 0,
            y: 0,
          },
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="h-full w-full flex flex-col items-center justify-center">
              <Spinner className="size-10" />
              <p className="text-sm text-muted-foreground mt-2">
                Loading Amazing Experience With Leemo...
              </p>
            </div>
          }
        >
          <Canvas />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default ProjectCanvas;
