import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morning Bet - Bet on Your Productivity",
  description: "Set your tasks tonight, stake your money, and actually get things done by noon. Miss a task? Your money goes to a charity you hate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
