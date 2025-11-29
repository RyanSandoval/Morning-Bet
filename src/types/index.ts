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
  consequence_target: string; // charity name or friend's email
  consequence_message: string | null; // roast message or charity description
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
  consequence_target: string;
  consequence_message?: string;
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
}
