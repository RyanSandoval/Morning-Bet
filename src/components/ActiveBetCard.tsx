'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';
import TaskItem from './TaskItem';
import Countdown from './Countdown';
import { Trophy, Flame, DollarSign } from 'lucide-react';
import type { BetWithTasks } from '@/types';

interface ActiveBetCardProps {
  bet: BetWithTasks;
}

export default function ActiveBetCard({ bet }: ActiveBetCardProps) {
  const router = useRouter();
  const [currentBet, setCurrentBet] = useState(bet);
  const [isExpired, setIsExpired] = useState(false);

  const completedCount = currentBet.tasks.filter(t => t.completed).length;
  const allComplete = completedCount === 3;

  const handleCompleteTask = async (taskId: number) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });

    if (response.ok) {
      const data = await response.json();
      setCurrentBet(data.bet);

      if (data.allComplete) {
        // Refresh the page to show success state
        router.refresh();
      }
    }
  };

  if (allComplete) {
    return (
      <Card variant="success" className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">You Did It!</h2>
        <p className="text-green-600 mb-4">
          All 3 tasks completed. Your ${currentBet.amount / 100} is safe!
        </p>
        <div className="space-y-2">
          {currentBet.tasks.map((task) => (
            <TaskItem key={task.id} task={task} disabled />
          ))}
        </div>
      </Card>
    );
  }

  if (isExpired && !allComplete) {
    return (
      <Card variant="danger" className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <Flame className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Time's Up!</h2>
        <p className="text-red-600 mb-4">
          You didn't complete all tasks. ${currentBet.amount / 100} goes to{' '}
          <strong>{currentBet.consequence_target}</strong>
        </p>
        <div className="space-y-2">
          {currentBet.tasks.map((task) => (
            <TaskItem key={task.id} task={task} disabled />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="highlight">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-orange-500" />
          <span className="text-2xl font-bold">${currentBet.amount / 100}</span>
          <span className="text-gray-500">on the line</span>
        </div>
        <div className="text-sm text-gray-500">
          {completedCount}/3 done
        </div>
      </div>

      <Countdown
        deadline={currentBet.deadline}
        onExpire={() => setIsExpired(true)}
      />

      <div className="mt-6 space-y-3">
        <h3 className="font-medium text-gray-700">Your Tasks:</h3>
        {currentBet.tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={handleCompleteTask}
            disabled={isExpired}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-orange-100 rounded-lg">
        <p className="text-sm text-orange-800">
          <strong>If you fail:</strong>{' '}
          {currentBet.consequence_type === 'charity'
            ? `$${currentBet.amount / 100} goes to ${currentBet.consequence_target}`
            : `$${currentBet.amount / 100} goes to ${currentBet.consequence_target} (who will definitely roast you)`}
        </p>
      </div>
    </Card>
  );
}
