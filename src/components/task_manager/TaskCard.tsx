import { useState } from "react";
import { motion } from "framer-motion";
import { springTransition } from "@/lib/animations";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CalendarIcon, Clock, LucideEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

interface Task {
  _id: string;
  _creationTime: number;
  projectId: Id<"projects">;
  taskName: string;
  description?: string;
  priority: "critical" | "high" | "medium" | "low";
  deadline: number;
  assigneeId: string;
  assignee?: {
    name?: string;
    imageUrl?: string;
  } | null;
}

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export function TaskCard({ task, isOwner }: TaskCardProps & { isOwner: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(task.taskName);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [deadline, setDeadline] = useState<Date | undefined>(task.deadline ? new Date(task.deadline) : undefined);
  
  const updateTask = useMutation(api.task_manager.tasks.updateTask);
  const projectMembers = useQuery(api.projects.getOwnerAndProjectMembers, { projectId: task.projectId });
  const allMembers = projectMembers ? [projectMembers.owner, ...projectMembers.members] : [];
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId);


  const deleteTask = useMutation(api.task_manager.tasks.deleteTask);

  const handleUpdate = async () => {
     try {
        await updateTask({
            taskId: task._id as Id<"tasks">,
            projectId: task.projectId,
            taskName,
            description,
            priority,
            deadline: deadline?.getTime(),
            assigneeId: assigneeId as Id<"users">,
        });
        toast.success("Task updated");
        setIsEditing(false);
     } catch (error) {
        toast.error("Failed to update task");
     }
  };

  const handleDelete = async () => {
      try {
          await deleteTask({
              taskId: task._id as Id<"tasks">,
              projectId: task.projectId,
          });
          toast.success("Task deleted");
      } catch (error) {
          toast.error("Failed to delete task");
      }
  };

// ... inside component

  return (
    <Dialog open={isEditing ? true : undefined} onOpenChange={(open) => !open && setIsEditing(false)}>
      <DialogTrigger asChild>
        <motion.div
           ref={setNodeRef}
           style={style}
           {...attributes}
           {...listeners}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95 }}
           whileHover={{ scale: 1.02, transition: springTransition }}
           transition={{ duration: 0.2 }}
           className={`cursor-pointer group relative`}
        >
            <Card className={`hover:border-sidebar-accent transition-colors ${isDragging ? "ring-2 ring-primary opacity-50" : ""}`}>
                <CardHeader className="p-1 flex flex-row items-center justify-between space-y-0">
                    <span className="text-sm font-medium line-clamp-2 leading-tight">
                    {task.taskName}
                    </span>
                    {task.assignee && (
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                        {task.assignee.name}
                        </span>
                        <Avatar className="h-4 w-4 border-2 border-background shrink-0">
                        <AvatarImage src={task.assignee.imageUrl} />
                        <AvatarFallback className="text-[9px]">
                            {task.assignee.name?.[0]}
                        </AvatarFallback>
                        </Avatar>
                    </div>
                    )}
                </CardHeader>
            </Card>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">{isEditing ? "Edit Task" : task.taskName}</DialogTitle>
          {isOwner && !isEditing && (
              <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <LucideEdit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
              </div>
          )}
        </DialogHeader>
        
        {!isEditing ? (
             <>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`capitalize ${priorityColors[task.priority]} px-2 py-0.5`}>
                        {task.priority} Priority
                    </Badge>
                    {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{format(task.deadline, "PPP")}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-6 py-4">
                {/* Description */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    {task.description ? (
                        <p className="text-sm leading-relaxed text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50">
                        {task.description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No description provided.</p>
                    )}
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Assignee</h4>
                    {task.assignee ? (
                        <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/50 w-fit pr-4">
                            <Avatar>
                                <AvatarImage src={task.assignee.imageUrl} />
                                <AvatarFallback>{task.assignee.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{task.assignee.name}</span>
                                <span className="text-xs text-muted-foreground">Assigned Member</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Unassigned</p>
                    )}
                </div>

                {/* Assigned On */}
                <div className="space-y-2">
                     <h4 className="text-sm font-medium text-muted-foreground">Assigned On</h4>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50 w-fit">
                        <Clock className="h-4 w-4" />
                        <span>{format(task._creationTime, "PPP")}</span>
                     </div>
                </div>
                </div>
             </>
        ) : (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Task Name</label>
                    <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                         <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Assignee</label>
                         <Select value={assigneeId} onValueChange={setAssigneeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Assign to" />
                            </SelectTrigger>
                            <SelectContent>
                                {allMembers.map(m => (
                                    <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {deadline ? format(deadline, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save Changes</Button>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
