import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/lib/animations";
import { TaskCard } from "./TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: any[];
  isOwner: boolean;
}

const columnColors = {
  todo: "bg-slate-500/10 text-slate-500",
  in_progress: "bg-blue-500/10 text-blue-500",
  review: "bg-purple-500/10 text-purple-500",
  done: "bg-green-500/10 text-green-500",
};

export function Column({ id, title, tasks, isOwner }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col flex-1 h-full bg-muted/50 rounded-lg p-2 min-w-[280px]">
      <div className="flex items-center justify-between p-3 font-semibold text-sm">
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${id === 'todo' ? 'bg-slate-400' : id === 'in_progress' ? 'bg-blue-400' : id === 'review' ? 'bg-purple-400' : 'bg-green-400'}`} />
            {title}
        </div>
        <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto font-mono">
            {tasks.length}
        </Badge>
      </div>



{/* inside column */}
      <ScrollArea className="flex-1 pr-3 -mr-3">
        <motion.div 
            ref={setNodeRef} 
            className="flex flex-col gap-3 p-2 min-h-[150px]"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
          <AnimatePresence mode="popLayout" initial={false}>
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} isOwner={isOwner} />
              ))}
          </AnimatePresence>
          
          {/* Placeholder for empty column to make it easier to drop */}
          {tasks.length === 0 && (
             <motion.div 
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="h-full border-2 border-dashed border-muted-foreground/10 rounded-lg flex items-center justify-center text-xs text-muted-foreground p-8"
             >
                No tasks found
             </motion.div>
          )}
        </motion.div>
      </ScrollArea>
    </div>
  );
}
