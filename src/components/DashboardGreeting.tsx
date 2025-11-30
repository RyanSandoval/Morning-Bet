'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

interface DashboardGreetingProps {
  userName: string;
  hasActiveBet: boolean;
}

export default function DashboardGreeting({ userName, hasActiveBet }: DashboardGreetingProps) {
  const [mounted, setMounted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'other'>('other');

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeOfDay('morning');
    } else if (hour >= 18 || hour < 5) {
      setTimeOfDay('evening');
    } else {
      setTimeOfDay('other');
    }
  }, []);

  // Show a neutral greeting until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Hey {userName.split(' ')[0]}!
          </h1>
        </div>
        <p className="text-muted-foreground">
          {hasActiveBet
            ? 'You have an active bet. Complete your tasks before the deadline!'
            : 'Set your tasks for tomorrow and put some money on the line.'}
        </p>
      </div>
    );
  }

  const isMorning = timeOfDay === 'morning';
  const isEvening = timeOfDay === 'evening';

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        {isMorning ? (
          <Sun className="w-6 h-6 text-primary" />
        ) : (
          <Moon className="w-6 h-6 text-primary" />
        )}
        <h1 className="text-2xl font-bold text-foreground">
          {isMorning
            ? 'Good morning! Time to crush it.'
            : isEvening
            ? 'Good evening! Ready to plan tomorrow?'
            : `Hey ${userName.split(' ')[0]}!`}
        </h1>
      </div>
      <p className="text-muted-foreground">
        {hasActiveBet
          ? 'You have an active bet. Complete your tasks before the deadline!'
          : isMorning
          ? 'No active bet. Create one tonight to stay accountable tomorrow.'
          : 'Set your tasks for tomorrow and put some money on the line.'}
      </p>
    </div>
  );
}
