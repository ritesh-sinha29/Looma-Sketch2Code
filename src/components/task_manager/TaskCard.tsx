import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springTransition } from "@/lib/animations";
import { 
  cardVariants, 
  badgeVariants, 
  avatarVariants, 
  pulseBadgeVariants,
  urgencyVariants,
  quickActionVariants 
} from "@/lib/taskCardAnimations";
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
import { 
  CalendarIcon, 
  Clock, 
  LucideEdit, 
  Trash2, 
  AlertTriangle, 
  AlertCircle,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  GripVertical,
  CheckCircle2
} from "lucide-react";
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
  status: "todo" | "in_progress" | "review" | "done";
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

// Enhanced priority styling with gradients and visual indicators
const priorityStyles = {
  critical: {
    badge: "bg-red-500/15 text-red-600 border-red-500/30 shadow-sm shadow-red-500/20",
    border: "border-l-red-500",
    gradient: "from-red-500/5 via-transparent to-transparent",
    icon: Flame,
    glow: "hover:shadow-red-500/30"
  },
  high: {
    badge: "bg-orange-500/15 text-orange-600 border-orange-500/30 shadow-sm shadow-orange-500/20",
    border: "border-l-orange-500",
    gradient: "from-orange-500/5 via-transparent to-transparent",
    icon: ArrowUp,
    glow: "hover:shadow-orange-500/30"
  },
  medium: {
    badge: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 shadow-sm shadow-yellow-500/20",
    border: "border-l-yellow-500",
    gradient: "from-yellow-500/5 via-transparent to-transparent",
    icon: Minus,
    glow: "hover:shadow-yellow-500/30"
  },
  low: {
    badge: "bg-blue-500/15 text-blue-600 border-blue-500/30 shadow-sm shadow-blue-500/20",
    border: "border-l-blue-500",
    gradient: "from-blue-500/5 via-transparent to-transparent",
    icon: ArrowDown,
    glow: "hover:shadow-blue-500/30"
  },
};

// Status-based styling (unified to match 'todo' look for all)
const statusStyles = {
  todo: "border-l-4 border-l-border/50",
  in_progress: "border-l-4 border-l-border/50",
  review: "border-l-4 border-l-border/50",
  done: "border-l-4 border-l-border/50",
};

const doneStyle = "";

// Deadline urgency calculator
const getDeadlineUrgency = (deadline: number) => {
  const now = Date.now();
  const diff = deadline - now;
  const days = diff / (1000 * 60 * 60 * 24);
  
  if (days < 0) {
    return { 
      color: 'text-red-500', 
      bgColor: 'bg-red-500/10',
      Icon: AlertTriangle, 
      animate: true,
      label: 'Overdue'
    };
  }
  if (days <= 2) {
    return { 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-500/10',
      Icon: AlertCircle, 
      animate: false,
      label: 'Due soon'
    };
  }
  return { 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted/50',
    Icon: CalendarIcon,
    animate: false,
    label: ''
  };
};

export function TaskCard({ task, isOwner, currentUserId }: TaskCardProps & { isOwner: boolean; currentUserId?: Id<"users"> }) {
  const canDrag = isOwner || (currentUserId && task.assigneeId === currentUserId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task }, disabled: !canDrag });

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

  const PriorityIcon = priorityStyles[task.priority].icon;
  const deadlineUrgency = task.deadline ? getDeadlineUrgency(task.deadline) : null;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Dialog open={isEditing ? true : undefined} onOpenChange={(open) => !open && setIsEditing(false)}>
      <DialogTrigger asChild>
        <motion.div
           ref={setNodeRef}
           style={style}
           {...attributes}
           {...listeners}
           variants={cardVariants}
           initial="hidden"
           animate={isDragging ? "dragging" : "visible"}
           whileHover="hover"
           whileTap="tap"
           onHoverStart={() => setIsHovered(true)}
           onHoverEnd={() => setIsHovered(false)}
           className={`group relative ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${task.status === 'done' ? doneStyle : ''}`}
        >
            <Card className={`
              relative overflow-hidden
              transition-all duration-300
              ${statusStyles[task.status]}
              ${isDragging ? "ring-2 ring-primary shadow-2xl" : "shadow-sm hover:shadow-lg"}
              ${priorityStyles[task.priority].glow}
              backdrop-blur-sm
              p-0
            `}>
                {/* Drag handle indicator */}
                <AnimatePresence>
                  {isHovered && canDrag && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 0.3, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      <GripVertical className="h-3 w-3" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <CardHeader className="p-1.5 flex flex-row items-center justify-between space-y-0 text-left relative">
                    <div className="flex flex-col gap-1 flex-1 mr-2">
                        {/* Priority badge with icon */}
                        <motion.div
                          variants={badgeVariants}
                          initial="initial"
                          animate={task.priority === 'critical' ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } } : "animate"}
                          whileHover="hover"
                          className="w-fit"
                        >
                          <Badge 
                            variant="outline" 
                            className={`
                              flex items-center gap-1 px-1 py-0 text-[10px] font-semibold
                              ${priorityStyles[task.priority].badge}
                              transition-all duration-200
                            `}
                          >
                            <PriorityIcon className="h-2.5 w-2.5" />
                            <span className="capitalize">{task.priority}</span>
                          </Badge>
                        </motion.div>

                        <span className={`text-sm font-medium line-clamp-1 leading-tight ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.taskName}
                        </span>
                        
                        {task.deadline && deadlineUrgency && (
                            <motion.div 
                              className={`flex items-center gap-1 text-[9px] ${deadlineUrgency.color} w-fit`}
                              animate={deadlineUrgency.animate ? {
                                scale: [1, 1.1, 1],
                                transition: {
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              } : {}}
                            >
                                <deadlineUrgency.Icon className="h-2.5 w-2.5" />
                                <span className="font-medium">{format(task.deadline, "MMM dd")}</span>
                                {deadlineUrgency.label && (
                                  <span className="text-[8px] opacity-75">• {deadlineUrgency.label}</span>
                                )}
                            </motion.div>
                        )}
                    </div>
                    {task.assignee && (
                    <motion.div 
                      variants={avatarVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      className="flex items-center gap-1 cursor-pointer"
                      title={task.assignee.name}
                    >
                        <Avatar className="h-8 w-8 ring-1 ring-background shadow-sm transition-all">
                          <AvatarImage src={task.assignee.imageUrl} />
                          <AvatarFallback className="text-[10px] font-semibold">
                              {task.assignee.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                    </motion.div>
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
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <motion.div
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <Badge variant="outline" className={`capitalize ${priorityStyles[task.priority].badge} px-2 py-1 flex items-center gap-1.5`}>
                          <PriorityIcon className="h-3.5 w-3.5" />
                          {task.priority} Priority
                      </Badge>
                    </motion.div>
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
