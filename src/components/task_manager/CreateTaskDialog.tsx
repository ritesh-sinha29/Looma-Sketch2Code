import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateTaskDialogProps {
  projectId: Id<"projects">;
  children?: React.ReactNode;
}

export function CreateTaskDialog({ projectId, children }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [deadline, setDeadline] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const Members = useQuery(api.projects.getOwnerAndProjectMembers, { projectId });
  const createTask = useMutation(api.task_manager.tasks.createTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !assigneeId || !deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        projectId,
        taskName,
        description,
        assigneeId: assigneeId as Id<"users">,
        priority: priority as "critical" | "high" | "medium" | "low",
        status: "todo",
        deadline: deadline.getTime(),
      });
      toast.success("Task created successfully");
      setOpen(false);
      // Reset form
      setTaskName("");
      setDescription("");
      setAssigneeId("");
      setPriority("medium");
      setDeadline(undefined);
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allMembers = Members ? [Members.owner, ...Members.members] : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Name</label>
            <Input
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback className="text-[10px]">{member.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!deadline && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
