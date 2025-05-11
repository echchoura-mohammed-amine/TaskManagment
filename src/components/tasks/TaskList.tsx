"use client";

import type { Task } from '@/lib/types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onTasksMutated: () => void; // To trigger re-fetch or re-render
}

export default function TaskList({ tasks, onEditTask, onTasksMutated }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground opacity-50"><path d="M9 12h6"/><path d="M9 12h6"/><path d="M12 9v6"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/><path d="M9 12h6"/></svg>
        <p className="text-xl font-semibold text-muted-foreground">No tasks yet!</p>
        <p className="text-sm text-muted-foreground">Click "Add Task" to get started.</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-8">
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground/80">Pending Tasks ({pendingTasks.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} onTaskMutated={onTasksMutated} />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground/80">Completed Tasks ({completedTasks.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} onTaskMutated={onTasksMutated} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
