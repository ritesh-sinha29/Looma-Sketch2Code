import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import {  Column } from "./TaskColumn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanSquare, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format, isToday, isTomorrow, isPast, isFuture } from "date-fns";

interface TaskBoardProps {
  projectId: Id<"projects">;
  isOwner: boolean;
}

const COLUMNS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

type ColumnId = keyof typeof COLUMNS;

export function TaskBoard({ projectId, isOwner }: TaskBoardProps) {
  const tasks = useQuery(api.task_manager.tasks.getTasks, { projectId });
  const updateStatus = useMutation(api.task_manager.tasks.updateTaskStatus);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5 // 5px movement required before drag starts prevents accidental drags on clicks
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status for Kanban
  const columns = useMemo(() => {
    if (!tasks) return { todo: [], in_progress: [], review: [], done: [] };
    const cols = { todo: [], in_progress: [], review: [], done: [] } as Record<ColumnId, typeof tasks>;
    tasks.forEach((task) => {
        if (cols[task.status as ColumnId]) {
            cols[task.status as ColumnId].push(task);
        }
    });
    return cols;
  }, [tasks]);

  // Group tasks by date for Timeline
  const timelineGroups = useMemo(() => {
    if (!tasks) return { overdue: [], today: [], tomorrow: [], upcoming: [] };
    const groups = { overdue: [], today: [], tomorrow: [], upcoming: [] } as Record<string, typeof tasks>;
    
    tasks.forEach((task) => {
        const date = new Date(task.deadline);
        if (isPast(date) && !isToday(date) && task.status !== "done") {
            groups.overdue.push(task);
        } else if (isToday(date)) {
            groups.today.push(task);
        } else if (isTomorrow(date)) {
            groups.tomorrow.push(task);
        } else {
            groups.upcoming.push(task);
        }
    });
    return groups;
  }, [tasks]);


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
        setActiveId(null);
        return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if dropped on a column or a card
    // If dropped on a column, overId is the column id (status)
    // If dropped on a card, handle via that card's column
    
    let newStatus = overId as ColumnId;

    // If overId is not a column key, find the task and get its status
    if (!Object.keys(COLUMNS).includes(overId)) {
        const overTask = tasks?.find(t => t._id === overId);
        if (overTask) {
            newStatus = overTask.status as ColumnId;
        }
    }

    if (activeId !== overId) {
        // Optimistic update could happen here, but for now we rely on mutation
        const task = tasks?.find((t) => t._id === activeId);
        if (task && task.status !== newStatus) {
            updateStatus({ taskId: task._id as Id<"tasks">, status: newStatus });
        }
    }

    setActiveId(null);
  };



// ... inside component

  if (!tasks) return null;

  return (
    <div className="flex flex-col h-full">
        <Tabs defaultValue="board" className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-none px-1">
                 <TabsList>
                    <TabsTrigger value="board">
                        <KanbanSquare className="mr-2 h-4 w-4" /> Board
                    </TabsTrigger>
                    <TabsTrigger value="timeline">
                        <CalendarDays className="mr-2 h-4 w-4" /> Timeline
                    </TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                     <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                     </Button>
                     {/* Create button will be injected from parent via Layout if needed, or here */}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <TabsContent value="board" className="flex-1 min-h-0 mt-0" asChild>
                    <motion.div
                        key="board"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                                {Object.entries(COLUMNS).map(([id, title]) => (
                                    <Column
                                        key={id}
                                        id={id}
                                        title={title}
                                        tasks={columns[id as ColumnId]}
                                        isOwner={isOwner}
                                    />
                                ))}
                            </div>
                            <DragOverlay>
                                {activeId ? (
                                     <TaskCard task={tasks.find(t => t._id === activeId)!} isOwner={isOwner} />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </motion.div>
                </TabsContent>

                <TabsContent value="timeline" className="flex-1 min-h-0 mt-0 overflow-y-auto" asChild>
                    <motion.div
                         key="timeline"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         transition={{ duration: 0.2 }}
                    >
                        <div className="space-y-8 pr-4 pb-10">
                            {/* Render timeline groups */}
                            {Object.entries(timelineGroups).map(([group, groupTasks]) => (
                                 groupTasks.length > 0 && (
                                    <div key={group} className="space-y-4">
                                        <h3 className="font-semibold text-lg capitalize flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                                            {group.replace("_", " ")}
                                            <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">
                                                {groupTasks.length}
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {groupTasks.map(task => (
                                                <div key={task._id} className="opacity-90 hover:opacity-100 transition-opacity">
                                                     <TaskCard task={task} isOwner={isOwner} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                 )
                            ))}
                             {tasks.length === 0 && (
                                <div className="text-center text-muted-foreground py-20">
                                    No tasks found. Create one to get started!
                                </div>
                            )}
                        </div>
                    </motion.div>
                </TabsContent>
            </AnimatePresence>
        </Tabs>
    </div>
  );
}
