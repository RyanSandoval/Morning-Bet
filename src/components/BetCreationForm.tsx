'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { DollarSign, Target, AlertTriangle, User, Building } from 'lucide-react';

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

  // Form state
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
            className={`w-3 h-3 rounded-full transition-colors ${
              s === step ? 'bg-orange-500' : s < step ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Amount */}
      {step === 1 && (
        <Card className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold">Set Your Stakes</h2>
          </div>
          <p className="text-gray-600 mb-6">
            How much are you willing to bet on yourself? This money will be charged if you don't complete your tasks by noon.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {[5, 10, 15, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`w-16 h-16 rounded-xl font-bold text-lg transition-all ${
                    amount === val
                      ? 'bg-orange-500 text-white scale-110'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500">
              Choose between $5 and $20
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canProceed()}>
              Next: Set Tasks
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Tasks */}
      {step === 2 && (
        <Card className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold">Your Top 3 Tasks</h2>
          </div>
          <p className="text-gray-600 mb-6">
            What do you want to accomplish by noon tomorrow? Be specific!
          </p>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
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

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canProceed()}>
              Next: Set Consequence
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Consequence */}
      {step === 3 && (
        <Card className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold">Set Your Consequence</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Where should your money go if you fail? Pick something that will REALLY motivate you!
          </p>

          {/* Consequence Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setConsequenceType('charity')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                consequenceType === 'charity'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="w-5 h-5" />
              Charity You Hate
            </button>
            <button
              onClick={() => setConsequenceType('friend')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                consequenceType === 'friend'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="w-5 h-5" />
              Friend Who'll Roast You
            </button>
          </div>

          {consequenceType === 'charity' ? (
            <div className="space-y-4">
              <Input
                label="Charity/Organization Name"
                placeholder="Enter the organization name..."
                value={consequenceTarget}
                onChange={(e) => setConsequenceTarget(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_CHARITIES.map((charity) => (
                  <button
                    key={charity}
                    onClick={() => setConsequenceTarget(charity)}
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {charity}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Friend's Email"
                type="email"
                placeholder="friend@example.com"
                value={consequenceTarget}
                onChange={(e) => setConsequenceTarget(e.target.value)}
              />
              <Input
                label="Roast Message (optional)"
                placeholder="What should they say when you fail?"
                value={consequenceMessage}
                onChange={(e) => setConsequenceMessage(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Your friend will receive your ${amount} and permission to roast you mercilessly.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={!canProceed()} isLoading={isLoading}>
              Lock In My Bet
            </Button>
          </div>
        </Card>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Your Bet Summary</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Amount: ${amount}</li>
          <li>Tasks: {tasks.filter(t => t.trim()).length}/3 set</li>
          <li>Deadline: Tomorrow at 12:00 PM</li>
          {consequenceTarget && (
            <li>
              Consequence: {consequenceType === 'charity' ? 'Donation to' : 'Payment to'} {consequenceTarget}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
