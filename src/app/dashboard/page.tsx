import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getActiveBetForUser, getBetsForUser, getUserById } from '@/lib/supabase';
import Header from '@/components/Header';
import ActiveBetCard from '@/components/ActiveBetCard';
import BetCreationForm from '@/components/BetCreationForm';
import BetHistory from '@/components/BetHistory';
import DashboardGreeting from '@/components/DashboardGreeting';

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Get data from Supabase
  let user: { name: string; email: string } | null = null;

  try {
    const dbUser = await getUserById(session.userId);
    if (dbUser) {
      user = { name: dbUser.name, email: dbUser.email };
    }
  } catch {
    // Fallback to session data
  }

  // Fallback to session data if database failed
  if (!user) {
    user = { name: session.name, email: session.email };
  }

  const activeBet = await getActiveBetForUser(session.userId).catch(() => null);
  const allBets = await getBetsForUser(session.userId).catch(() => []);

  // Past bets (completed ones)
  const pastBets = allBets.filter(b => b.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <DashboardGreeting userName={user.name} hasActiveBet={!!activeBet} />

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
