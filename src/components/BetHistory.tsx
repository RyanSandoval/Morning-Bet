'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BetWithTasks } from '@/types';

interface BetHistoryProps {
  bets: BetWithTasks[];
}

export default function BetHistory({ bets }: BetHistoryProps) {
  if (bets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No bet history yet. Create your first bet tonight!
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: bets.length,
    won: bets.filter(b => b.status === 'won').length,
    lost: bets.filter(b => b.status === 'lost').length,
    moneyLost: bets.filter(b => b.status === 'lost').reduce((sum, b) => sum + b.amount, 0) / 100,
    moneySaved: bets.filter(b => b.status === 'won').reduce((sum, b) => sum + b.amount, 0) / 100,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Bets</p>
          </CardContent>
        </Card>
        <Card className="text-center" variant="success">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-success">{stats.won}</p>
            <p className="text-sm text-success/80">Won</p>
          </CardContent>
        </Card>
        <Card className="text-center" variant="destructive">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-destructive">{stats.lost}</p>
            <p className="text-sm text-destructive/80">Lost</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-primary">${stats.moneySaved}</p>
            <p className="text-sm text-muted-foreground">Saved</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bets.slice(0, 10).map((bet) => (
              <div
                key={bet.id}
                className={cn(
                  "p-4 rounded-lg border",
                  bet.status === 'won'
                    ? 'bg-success/10 border-success/30'
                    : bet.status === 'lost'
                    ? 'bg-destructive/10 border-destructive/30'
                    : 'bg-muted/50 border-border'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {bet.status === 'won' ? (
                      <Trophy className="w-5 h-5 text-success" />
                    ) : bet.status === 'lost' ? (
                      <Flame className="w-5 h-5 text-destructive" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium text-foreground">
                      ${bet.amount / 100} - {bet.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(bet.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {bet.tasks.map((task, i) => (
                    <span key={task.id}>
                      {task.completed ? '✓' : '✗'} {task.title}
                      {i < 2 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
                {bet.status === 'lost' && (
                  <p className="text-sm text-destructive mt-2">
                    Sent to: {bet.consequence_target}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
