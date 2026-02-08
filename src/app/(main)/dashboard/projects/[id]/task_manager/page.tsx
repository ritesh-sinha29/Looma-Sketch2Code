"use client";

import { motion } from "framer-motion";
import { slideUp, staggerContainer } from "@/lib/animations";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TaskBoard } from "@/components/task_manager/TaskBoard";
import { CreateTaskDialog } from "@/components/task_manager/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TasksPage = () => {
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
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <motion.div 
      className="w-full h-full flex flex-col p-6 space-y-6 overflow-hidden select-none"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={slideUp} className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-4">
            <Link href={`/dashboard/projects/${params.id}`}>
            <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            </Link>
            <div>
            <h1 className="text-2xl font-semibold">Task Board</h1>
            <p className="text-sm text-muted-foreground">
                Manage tasks for {project?.projectName}
            </p>
            </div>
        </div>

        {isOwner && (
            <CreateTaskDialog projectId={params.id}>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </CreateTaskDialog>
        )}
      </motion.div>

      <motion.div variants={slideUp} className="flex-1 min-h-0 overflow-hidden">
        <TaskBoard projectId={params.id} isOwner={!!isOwner} currentUserId={currentUser?._id} />
      </motion.div>
    </motion.div>
  );
};

export default TasksPage;
