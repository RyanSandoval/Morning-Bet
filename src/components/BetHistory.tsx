'use client';

import { format } from 'date-fns';
import Card from './Card';
import { Trophy, Flame, Clock } from 'lucide-react';
import type { BetWithTasks } from '@/types';

interface BetHistoryProps {
  bets: BetWithTasks[];
}

export default function BetHistory({ bets }: BetHistoryProps) {
  if (bets.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">
          No bet history yet. Create your first bet tonight!
        </p>
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
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Bets</p>
        </Card>
        <Card className="text-center" variant="success">
          <p className="text-3xl font-bold text-green-700">{stats.won}</p>
          <p className="text-sm text-green-600">Won</p>
        </Card>
        <Card className="text-center" variant="danger">
          <p className="text-3xl font-bold text-red-700">{stats.lost}</p>
          <p className="text-sm text-red-600">Lost</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-orange-600">${stats.moneySaved}</p>
          <p className="text-sm text-gray-500">Saved</p>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <h3 className="font-bold text-lg mb-4">Recent Bets</h3>
        <div className="space-y-4">
          {bets.slice(0, 10).map((bet) => (
            <div
              key={bet.id}
              className={`p-4 rounded-lg border ${
                bet.status === 'won'
                  ? 'bg-green-50 border-green-200'
                  : bet.status === 'lost'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {bet.status === 'won' ? (
                    <Trophy className="w-5 h-5 text-green-600" />
                  ) : bet.status === 'lost' ? (
                    <Flame className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="font-medium">
                    ${bet.amount / 100} - {bet.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(bet.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {bet.tasks.map((task, i) => (
                  <span key={task.id}>
                    {task.completed ? '✓' : '✗'} {task.title}
                    {i < 2 ? ' • ' : ''}
                  </span>
                ))}
              </div>
              {bet.status === 'lost' && (
                <p className="text-sm text-red-600 mt-2">
                  Sent to: {bet.consequence_target}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
