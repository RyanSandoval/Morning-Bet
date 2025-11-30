import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Header from '@/components/Header';
import ActiveBetCard from '@/components/ActiveBetCard';
import BetCreationForm from '@/components/BetCreationForm';
import BetHistory from '@/components/BetHistory';
import { Moon, Sun } from 'lucide-react';
import type { BetWithTasks, User } from '@/types';

// Safe database imports - may fail on Vercel
let getActiveBetForUser: ((userId: number) => BetWithTasks | undefined) | null = null;
let getBetsForUser: ((userId: number) => BetWithTasks[]) | null = null;
let getUserById: ((id: number) => User | undefined) | null = null;

try {
  const db = require('@/lib/db');
  getActiveBetForUser = db.getActiveBetForUser;
  getBetsForUser = db.getBetsForUser;
  getUserById = db.getUserById;
} catch {
  // Database not available (Vercel serverless)
}

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Try to get data from database, fallback to session data
  let user: { name: string; email: string } | null = null;
  let activeBet: BetWithTasks | undefined = undefined;
  let allBets: BetWithTasks[] = [];

  try {
    if (getUserById) {
      const dbUser = getUserById(session.userId);
      if (dbUser) {
        user = { name: dbUser.name, email: dbUser.email };
      }
    }
    if (getActiveBetForUser) {
      activeBet = getActiveBetForUser(session.userId);
    }
    if (getBetsForUser) {
      allBets = getBetsForUser(session.userId);
    }
  } catch {
    // Database error - use session data
  }

  // Fallback to session data if database failed
  if (!user) {
    user = { name: session.name, email: session.email };
  }

  // Determine if it's morning (time to complete tasks) or evening (time to create bet)
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isEvening = hour >= 18 || hour < 5;

  // Past bets (completed ones)
  const pastBets = allBets.filter(b => b.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Time-based greeting */}
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
                : `Hey ${user?.name.split(' ')[0]}!`}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {activeBet
              ? 'You have an active bet. Complete your tasks before the deadline!'
              : isMorning
              ? 'No active bet. Create one tonight to stay accountable tomorrow.'
              : 'Set your tasks for tomorrow and put some money on the line.'}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeBet ? (
            /* Active Bet View */
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Your Active Bet</h2>
              <ActiveBetCard bet={activeBet} />
            </section>
          ) : (
            /* Create Bet View */
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Create Tomorrow&apos;s Bet</h2>
              <BetCreationForm />
            </section>
          )}

          {/* History */}
          {pastBets.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Your Bet History</h2>
              <BetHistory bets={pastBets} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
