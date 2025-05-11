// Ensure this component is a Client Component to use hooks like useState, useEffect
"use client"; 

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListFilter, Loader2 } from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import type { Task } from '@/lib/types';
import { getTasks } from '@/actions/task.actions'; // Server action
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FilterStatus = "all" | "pending" | "completed";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isPending, startTransition] = useTransition(); // For fetch transition

  const { user } = useAuth();

  const fetchTasks = () => {
    if (!user) return;
    setIsLoading(true); // Set loading true at the start of fetch
    setError(null);
    startTransition(async () => {
      const result = await getTasks(); // Call the server action
      if (result.error) {
        setError(result.error);
        setTasks([]);
      } else if (result.tasks) {
        setTasks(result.tasks);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]); // Refetch when user changes (e.g., login/logout)

  const handleOpenNewTaskForm = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskMutated = () => {
    fetchTasks(); // Re-fetch tasks after mutation
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Task Dashboard</h1>
          <p className="text-muted-foreground">View and manage your daily tasks efficiently.</p>
        </div>
        <div className="flex gap-2 items-center">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter Tasks
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filter === "all"}
                onCheckedChange={() => setFilter("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filter === "pending"}
                onCheckedChange={() => setFilter("pending")}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filter === "completed"}
                onCheckedChange={() => setFilter("completed")}
              >
                Completed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleOpenNewTaskForm} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Task
          </Button>
        </div>
      </div>

      {isLoading || isPending ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
          <h3 className="text-xl font-semibold">Error loading tasks</h3>
          <p>{error}</p>
          <Button onClick={fetchTasks} variant="outline" className="mt-4">Retry</Button>
        </div>
      ) : (
        <TaskList tasks={filteredTasks} onEditTask={handleEditTask} onTasksMutated={handleTaskMutated} />
      )}

      <TaskForm
        isOpen={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={editingTask}
        onTaskMutated={handleTaskMutated}
      />
    </div>
  );
}
