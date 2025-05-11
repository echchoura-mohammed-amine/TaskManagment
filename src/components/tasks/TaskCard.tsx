"use client";

import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarDays, Edit3, FileText, MoreVertical, Trash2, AlertTriangle } from 'lucide-react';
import { deleteTask, toggleTaskCompletion } from '@/actions/task.actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import TaskNotesDialog from './TaskNotesDialog';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onTaskMutated: () => void;
}

export default function TaskCard({ task, onEdit, onTaskMutated }: TaskCardProps) {
  const { toast } = useToast();
  const [isTogglePending, startToggleTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  const handleToggleComplete = () => {
    startToggleTransition(async () => {
      const result = await toggleTaskCompletion(task.id, !task.completed);
      if (result?.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Task Updated', description: `Task "${task.title}" marked as ${!task.completed ? 'complete' : 'incomplete'}.` });
        onTaskMutated();
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      // Add confirmation dialog here if desired
      const result = await deleteTask(task.id);
      if (result?.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Task Deleted', description: `Task "${task.title}" has been deleted.` });
        onTaskMutated();
      }
    });
  };
  
  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = dueDate && !task.completed && isPast(dueDate) && differenceInDays(new Date(), dueDate) >= 0 ;
  // Task is due soon if it's not completed, due date exists, and it's today or tomorrow
  const daysUntilDue = dueDate ? differenceInDays(dueDate, new Date()) : null;
  const isDueSoon = dueDate && !task.completed && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 1;


  return (
    <>
      <Card className={cn(
        "w-full shadow-lg hover:shadow-xl transition-shadow duration-300",
        task.completed && "bg-muted/50 opacity-70",
        isOverdue && "border-destructive ring-2 ring-destructive/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={handleToggleComplete}
                disabled={isTogglePending}
                aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                className="mt-1"
              />
              <CardTitle className={cn("text-lg font-semibold leading-tight", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsNotesDialogOpen(true)} className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>View/Edit Notes</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} disabled={isDeletePending} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Task</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {task.description && (
            <CardDescription className={cn("text-sm pt-1", task.completed && "line-through")}>
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pb-4">
          {/* Additional content like tags or subtasks could go here */}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-3 border-t">
          <div>
            {dueDate && (
              <div className={cn(
                  "flex items-center",
                  isOverdue && "text-destructive font-medium",
                  isDueSoon && !isOverdue && "text-amber-600 dark:text-amber-500 font-medium"
                )}>
                <CalendarDays className="mr-1.5 h-4 w-4" />
                <span>Due: {format(dueDate, 'MMM d, yyyy')}</span>
                {isOverdue && <AlertTriangle className="ml-1.5 h-4 w-4" />}
              </div>
            )}
          </div>
          <div className="text-xs">
            Created: {format(task.createdAt.toDate(), 'MMM d, yy')}
          </div>
        </CardFooter>
      </Card>
      <TaskNotesDialog
        isOpen={isNotesDialogOpen}
        onOpenChange={setIsNotesDialogOpen}
        task={task}
        onTaskMutated={onTaskMutated}
      />
    </>
  );
}
