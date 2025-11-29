# Morning Bet

**Stop ignoring your morning plans.** Put real money on the line and actually get things done.

## The Problem

You plan the night before but wake up and ignore your own plan. Sound familiar?

## The Solution

Morning Bet makes you put your money where your mouth is:

1. **Every night** - Set your top 3 tasks for tomorrow morning
2. **Stake your money** - Put $5-$20 on the line
3. **Beat the clock** - Complete all 3 tasks by noon
4. **Fail?** - Your money goes to a charity you hate or a friend who'll roast you

## Features

- User authentication (email/password)
- Create bets with 3 tasks and a deadline (noon the next day)
- Choose your consequence:
  - **Charity you hate** - Your money goes to a cause that'll really sting
  - **Friend who'll roast you** - They get your money AND permission to mock you
- Real-time countdown timer
- Task completion tracking
- Bet history with win/loss statistics
- Stripe integration for real money stakes

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via better-sqlite3)
- **Payments**: Stripe
- **Auth**: JWT with httpOnly cookies

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Morning-Bet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CRON_SECRET=your-cron-secret-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bets/          # Bet management
│   │   ├── tasks/         # Task completion
│   │   ├── stripe/        # Payment processing
│   │   └── cron/          # Deadline processing
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
├── lib/                   # Utilities (db, auth, stripe)
└── types/                 # TypeScript type definitions
```

## How It Works

### Evening Mode (Creating a Bet)

1. User sets 3 specific tasks they want to complete tomorrow
2. User chooses stake amount ($5-$20)
3. User selects consequence (charity or friend)
4. Bet is created with a deadline of noon the next day

### Morning Mode (Completing Tasks)

1. User sees their active bet with countdown timer
2. User clicks tasks to mark them complete
3. If all 3 tasks are completed before noon = WIN
4. If deadline passes with incomplete tasks = LOSE

### Processing Results

- **Win**: Payment authorization is released (no charge)
- **Lose**: Payment is captured and sent to consequence recipient

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Cron Job Setup

To process expired bets automatically, set up a cron job to hit `/api/cron` every minute:

```bash
# Using Vercel Cron (vercel.json)
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "* * * * *"
  }]
}
```

## License

MIT
