"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, LucideX, LucideInfo, LucideLogIn, LucideCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const InvitePage = () => {
  const params = useParams();
  const inviteCode = params.code as string;
  const router = useRouter();

  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  // getting project by code...
  const project = useQuery(api.projects.getProjectByInviteCode, {
    inviteCode: inviteCode || "",
  });

  const joinProject = useMutation(api.projects.joinProject);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!project) return;

    setIsJoining(true);
    try {
      const result = await joinProject({ projectId: project._id });
      if (result.success) {
        toast.success("Joined project successfully!");
        router.push(`/dashboard/projects/${project._id}`);
      } else {
        toast.error(result.message || "Failed to join project");
      }
    } catch (error) {
      toast.error("An error occurred while joining");
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogin = () => {
    router.push("/auth");
  };

  // Loading State
  if (project === undefined || isAuthLoading) {
    return (
      <div className="bg-black w-screen h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
          }}
        />

        <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
          <div className="">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={35}
              height={35}
              className=""
            />
          </div>
          <h1 className="font-pop font-bold text-2xl text-white tracking-tight">
            Looma
          </h1>
        </div>

        <Spinner className="size-10 text-white" />
      </div>
    );
  }

  // Invalid Invite - Project not found
  if (project === null) {
    return (
      <div className="bg-black w-screen h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
          }}
        />

        <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
          <div className="">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={35}
              height={35}
              className=""
            />
          </div>
          <h1 className="font-pop font-bold text-2xl text-white tracking-tight">
            Looma
          </h1>
        </div>
        <Card className="w-[400px] backdrop-blur text-white">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <LucideX className="w-6 h-6" /> Invalid Invite
            </CardTitle>
            <CardDescription className="text-gray-600">
              This invite link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-black w-screen h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
        }}
      />

      <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
        <div className="">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={35}
            height={35}
            className=""
          />
        </div>
        <h1 className="font-pop font-bold text-2xl text-white tracking-tight">
          Looma
        </h1>
      </div>

      <div className="h-full w-full flex items-center justify-center relative z-10 px-4">
        <Card className="w-full max-w-md bg-gray-100 overflow-hidden">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={35}
              height={35}
              className=""
            />
          </div>
          <div className="text-center -mt-2">
            <h2 className="text-xl font-medium capitalize text-black">{project.projectName}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Invited by{" "}
              <span className="text-blue-500 font-medium">
                {project.ownerEmail}
              </span>
            </p>

            <div className="flex flex-col gap-3 my-4">
              {isAuthenticated ? (
                <Button
                  className="px-8! w-fit mx-auto cursor-pointer shadow hover:shadow-lg"
                  onClick={handleJoin}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Joining...
                    </>
                  ) : (
                    <>
                      Accept Invitation <LucideCheck className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-black text-sm  tracking-wider font-medium">
                    Authentication Required
                  </p>
                  <Button
                    variant="default"
                    className="text-xs cursor-pointer px-8!"
                    onClick={handleLogin}
                  >
                    Log in to Accept <LucideLogIn className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <LucideInfo className="w-3 h-3" />
              <span>You have been invited to join this project</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvitePage;
