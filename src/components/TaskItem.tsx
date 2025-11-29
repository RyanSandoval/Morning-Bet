'use client';

import { useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
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
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
        task.completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-orange-300'
      } ${!task.completed && !disabled ? 'cursor-pointer' : ''}`}
      onClick={handleComplete}
    >
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          task.completed
            ? 'bg-green-500 text-white'
            : 'border-2 border-gray-300'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
        ) : task.completed ? (
          <Check className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300" />
        )}
      </div>
      <span
        className={`flex-1 ${
          task.completed ? 'text-green-700 line-through' : 'text-gray-800'
        }`}
      >
        {task.title}
      </span>
      {task.completed && task.completed_at && (
        <span className="text-xs text-green-600">
          {new Date(task.completed_at).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
