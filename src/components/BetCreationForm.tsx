'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, AlertTriangle, User, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_CHARITIES = [
  'Political party you oppose',
  'NRA (or anti-gun org)',
  'Flat Earth Society',
  'Your rival sports team foundation',
];

export default function BetCreationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState(10);
  const [tasks, setTasks] = useState(['', '', '']);
  const [consequenceType, setConsequenceType] = useState<'charity' | 'friend'>('charity');
  const [consequenceTarget, setConsequenceTarget] = useState('');
  const [consequenceMessage, setConsequenceMessage] = useState('');

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tasks: tasks.filter(t => t.trim()),
          consequence_type: consequenceType,
          consequence_target: consequenceTarget,
          consequence_message: consequenceMessage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bet');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return amount >= 5 && amount <= 20;
      case 2:
        return tasks.filter(t => t.trim()).length === 3;
      case 3:
        return consequenceTarget.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              s === step ? 'bg-primary' : s < step ? 'bg-success' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step 1: Amount */}
      {step === 1 && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <CardTitle>Set Your Stakes</CardTitle>
            </div>
            <CardDescription>
              How much are you willing to bet on yourself? This money will be charged if you don&apos;t complete your tasks by noon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              {[5, 10, 15, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={cn(
                    "w-16 h-16 rounded-xl font-bold text-lg transition-all",
                    amount === val
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  ${val}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Choose between $5 and $20
            </p>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canProceed()}>
                Next: Set Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Tasks */}
      {step === 2 && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <CardTitle>Your Top 3 Tasks</CardTitle>
            </div>
            <CardDescription>
              What do you want to accomplish by noon tomorrow? Be specific!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <Input
                    placeholder={`Task ${index + 1}...`}
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceed()}>
                Next: Set Consequence
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Consequence */}
      {step === 3 && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <CardTitle>Set Your Consequence</CardTitle>
            </div>
            <CardDescription>
              Where should your money go if you fail? Pick something that will REALLY motivate you!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Consequence Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setConsequenceType('charity')}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
                  consequenceType === 'charity'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-border/80 text-muted-foreground'
                )}
              >
                <Building className="w-5 h-5" />
                Charity You Hate
              </button>
              <button
                onClick={() => setConsequenceType('friend')}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
                  consequenceType === 'friend'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-border/80 text-muted-foreground'
                )}
              >
                <User className="w-5 h-5" />
                Friend Who&apos;ll Roast You
              </button>
            </div>

            {consequenceType === 'charity' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="charity">Charity/Organization Name</Label>
                  <Input
                    id="charity"
                    name="charity"
                    type="text"
                    placeholder="Enter the organization name..."
                    value={consequenceTarget}
                    onChange={(e) => setConsequenceTarget(e.target.value)}
                    autoComplete="organization"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_CHARITIES.map((charity) => (
                    <Badge
                      key={charity}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setConsequenceTarget(charity)}
                    >
                      {charity}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="friendEmail">Friend&apos;s Email</Label>
                  <Input
                    id="friendEmail"
                    name="friendEmail"
                    type="email"
                    inputMode="email"
                    placeholder="friend@example.com"
                    value={consequenceTarget}
                    onChange={(e) => setConsequenceTarget(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roastMessage">Roast Message (optional)</Label>
                  <Input
                    id="roastMessage"
                    placeholder="What should they say when you fail?"
                    value={consequenceMessage}
                    onChange={(e) => setConsequenceMessage(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your friend will receive your ${amount} and permission to roast you mercilessly.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canProceed()} isLoading={isLoading}>
                Lock In My Bet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="mt-6" variant="highlight">
        <CardContent className="pt-6">
          <h3 className="font-medium text-foreground mb-2">Your Bet Summary</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Amount: ${amount}</li>
            <li>Tasks: {tasks.filter(t => t.trim()).length}/3 set</li>
            <li>Deadline: Tomorrow at 12:00 PM</li>
            {consequenceTarget && (
              <li>
                Consequence: {consequenceType === 'charity' ? 'Donation to' : 'Payment to'} {consequenceTarget}
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
