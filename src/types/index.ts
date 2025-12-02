export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Bet {
  id: number;
  user_id: number;
  amount: number; // in cents
  deadline: string; // ISO timestamp (noon of the target day)
  status: 'pending' | 'won' | 'lost' | 'processing';
  consequence_type: 'charity' | 'friend';
  consequence_target: string; // charity name (legacy) or friend's email
  consequence_message: string | null; // roast message or charity description
  charity_id: number | null; // FK to charities table (for verified charities)
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export interface Task {
  id: number;
  bet_id: number;
  title: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface BetWithTasks extends Bet {
  tasks: Task[];
}

export interface CreateBetInput {
  amount: number; // in dollars (5-20)
  tasks: string[]; // exactly 3 task titles
  consequence_type: 'charity' | 'friend';
  consequence_target: string; // charity name (for display) or friend's email
  consequence_message?: string;
  charity_id?: number; // ID of verified charity (when consequence_type is 'charity')
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
}

export interface Charity {
  id: number;
  name: string;
  description: string;
  category: 'political_left' | 'political_right' | 'environmental' | 'sports' | 'social' | 'religious' | 'other';
  logo_url: string | null;
  website_url: string | null;
  ein: string | null; // Tax ID for verification
  stripe_connect_account_id: string | null; // Required for actual transfers
  is_active: boolean;
  is_controversial: boolean; // For "charities you hate" feature
  created_at: string;
}

export interface Donation {
  id: number;
  bet_id: number;
  charity_id: number;
  user_id: number;
  amount: number; // in cents
  stripe_transfer_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  failure_reason: string | null;
  created_at: string;
}

export interface DonationWithDetails extends Donation {
  charity_name: string;
  user_email: string;
}
