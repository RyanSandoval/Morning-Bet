'use client';

import { useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onComplete?: (taskId: number) => Promise<void>;
  disabled?: boolean;
}

export default function TaskItem({ task, onComplete, disabled }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (task.completed || isLoading || disabled || !onComplete) return;

    setIsLoading(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border transition-all",
        task.completed
          ? 'bg-success/10 border-success/30'
          : 'bg-card border-border hover:border-primary/50',
        !task.completed && !disabled && 'cursor-pointer'
      )}
      onClick={handleComplete}
    >
      <div
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
          task.completed
            ? 'bg-success text-success-foreground'
            : 'border-2 border-muted-foreground/30'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : task.completed ? (
          <Check className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/30" />
        )}
      </div>
      <span
        className={cn(
          "flex-1",
          task.completed ? 'text-success line-through' : 'text-foreground'
        )}
      >
        {task.title}
      </span>
      {task.completed && task.completed_at && (
        <span className="text-xs text-success">
          {new Date(task.completed_at).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
