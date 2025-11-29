'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from './Button';
import { Sun, Moon, LogOut } from 'lucide-react';

interface HeaderProps {
  user?: { name: string; email: string } | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  // Determine if it's morning or evening (for theme)
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {isMorning ? (
            <Sun className="w-6 h-6 text-orange-500" />
          ) : (
            <Moon className="w-6 h-6 text-indigo-500" />
          )}
          <span className="font-bold text-xl">Morning Bet</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hey, {user.name.split(' ')[0]}!</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
