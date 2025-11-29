'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns';

interface CountdownProps {
  deadline: string;
  onExpire?: () => void;
}

export default function Countdown({ deadline, onExpire }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(deadline);
      const totalSeconds = differenceInSeconds(end, now);

      if (totalSeconds <= 0) {
        setIsExpired(true);
        onExpire?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-red-500">Time's Up!</p>
      </div>
    );
  }

  const urgencyColor =
    timeLeft.hours === 0 && timeLeft.minutes < 30
      ? 'text-red-500'
      : timeLeft.hours < 2
      ? 'text-orange-500'
      : 'text-gray-800';

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-1">Time remaining</p>
      <div className={`text-4xl font-mono font-bold ${urgencyColor}`}>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}
