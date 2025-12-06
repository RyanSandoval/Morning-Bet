'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
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
        router.refresh();
      }
    }
  };

  const handleStartNewBetAfterWin = async () => {
    // Mark the current bet as won
    await fetch('/api/bets/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betId: currentBet.id, status: 'won' }),
    });
    router.refresh();
  };

  if (allComplete) {
    return (
      <Card variant="success" className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-success mb-2">You Did It!</h2>
          <p className="text-success/80 mb-4">
            All 3 tasks completed. Your ${currentBet.amount / 100} is safe!
          </p>
          <div className="space-y-2 mb-6">
            {currentBet.tasks.map((task) => (
              <TaskItem key={task.id} task={task} disabled />
            ))}
          </div>
          <button
            onClick={handleStartNewBetAfterWin}
            className="w-full py-3 px-4 bg-success hover:bg-success/90 text-success-foreground font-semibold rounded-lg transition-colors"
          >
            Start New Bet
          </button>
        </CardContent>
      </Card>
    );
  }

  const handleStartNewBet = async () => {
    // Mark the current bet as lost
    await fetch('/api/bets/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betId: currentBet.id, status: 'lost' }),
    });
    router.refresh();
  };

  if (isExpired && !allComplete) {
    return (
      <Card variant="destructive" className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <Flame className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Time&apos;s Up!</h2>
          <p className="text-destructive/80 mb-4">
            You didn&apos;t complete all tasks. ${currentBet.amount / 100} goes to{' '}
            <strong>{currentBet.consequence_target}</strong>
          </p>
          <div className="space-y-2 mb-6">
            {currentBet.tasks.map((task) => (
              <TaskItem key={task.id} task={task} disabled />
            ))}
          </div>
          <button
            onClick={handleStartNewBet}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
          >
            Start New Bet
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="highlight">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold text-foreground">${currentBet.amount / 100}</span>
            <span className="text-muted-foreground">on the line</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {completedCount}/3 done
          </div>
        </div>

        <Countdown
          deadline={currentBet.deadline}
          onExpire={() => setIsExpired(true)}
        />

        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-foreground">Your Tasks:</h3>
          {currentBet.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              disabled={isExpired}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground">
            <strong>If you fail:</strong>{' '}
            {currentBet.consequence_type === 'charity'
              ? `$${currentBet.amount / 100} goes to ${currentBet.consequence_target}`
              : `$${currentBet.amount / 100} goes to ${currentBet.consequence_target} (who will definitely roast you)`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
