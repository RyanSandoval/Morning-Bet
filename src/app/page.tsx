import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Target, DollarSign, Clock, Flame, CheckCircle, ArrowRight } from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Stop Ignoring Your<br />
          <span className="text-orange-500">Morning Plans</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          You plan the night before but wake up and ignore your own plan.
          Morning Bet puts real money on the line so you actually follow through.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8">
            Start Betting on Yourself
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Set Your Tasks</h3>
              <p className="text-gray-600">
                Every night, choose your top 3 tasks for tomorrow morning.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Stake Your Money</h3>
              <p className="text-gray-600">
                Put $5-$20 on the line. Real stakes = real motivation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Beat the Clock</h3>
              <p className="text-gray-600">
                Complete all 3 tasks by noon, or lose your money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consequences */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">The Stakes Are Real</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            If you fail, your money goes somewhere that will really sting.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-8 h-8 text-red-500" />
                <h3 className="font-bold text-lg">Charity You Hate</h3>
              </div>
              <p className="text-gray-700">
                Your money goes to a cause you cannot stand. The NRA, flat earth society,
                your rival sports team foundation... whatever makes you cringe.
              </p>
            </div>
            <div className="p-6 rounded-xl border-2 border-orange-200 bg-orange-50">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-8 h-8 text-orange-500" />
                <h3 className="font-bold text-lg">Friend Who Will Roast You</h3>
              </div>
              <p className="text-gray-700">
                Pick a friend who will receive your money AND permission to roast you
                mercilessly. They will make sure you never forget your failure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">
                &quot;I have tried every productivity app. This is the only thing that actually works.&quot;
              </p>
            </div>
            <div className="p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">
                &quot;The fear of funding my annoying cousin&apos;s business is incredibly motivating.&quot;
              </p>
            </div>
            <div className="p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">
                &quot;10 day streak and counting. Have not lost a bet yet!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Actually Get Things Done?</h2>
          <p className="text-gray-600 mb-8">
            Start tonight. Set your first bet. Win tomorrow.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Morning Bet - Put your money where your mouth is.</p>
        </div>
      </footer>
    </div>
  );
}
