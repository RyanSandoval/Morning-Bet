import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, Bet, Task, BetWithTasks, Charity, Donation } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

function getClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
}

// User operations
export async function createUser(email: string, name: string, passwordHash: string): Promise<User> {
  const { data, error } = await getClient()
    .from('users')
    .insert({ email, name, password_hash: passwordHash })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await getClient()
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserById(id: number): Promise<User | null> {
  const { data, error } = await getClient()
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Bet operations
export async function createBet(
  userId: number,
  amount: number,
  deadline: string,
  consequenceType: 'charity' | 'friend',
  consequenceTarget: string,
  consequenceMessage: string | null,
  tasks: string[],
  charityId: number | null = null
): Promise<BetWithTasks> {
  const client = getClient();

  // Create bet
  const { data: bet, error: betError } = await client
    .from('bets')
    .insert({
      user_id: userId,
      amount,
      deadline,
      consequence_type: consequenceType,
      consequence_target: consequenceTarget,
      consequence_message: consequenceMessage,
      charity_id: charityId,
    })
    .select()
    .single();

  if (betError) throw betError;

  // Create tasks
  const taskInserts = tasks.map(title => ({
    bet_id: bet.id,
    title,
  }));

  const { data: taskData, error: taskError } = await client
    .from('tasks')
    .insert(taskInserts)
    .select();

  if (taskError) throw taskError;

  return {
    ...bet,
    tasks: taskData.map((t: Task) => ({ ...t, completed: Boolean(t.completed) })),
  };
}

export async function getBetById(id: number): Promise<BetWithTasks | null> {
  const client = getClient();

  const { data: bet, error: betError } = await client
    .from('bets')
    .select('*')
    .eq('id', id)
    .single();

  if (betError) {
    if (betError.code === 'PGRST116') return null;
    throw betError;
  }

  const { data: tasks, error: taskError } = await client
    .from('tasks')
    .select('*')
    .eq('bet_id', id);

  if (taskError) throw taskError;

  return {
    ...bet,
    tasks: (tasks || []).map((t: Task) => ({ ...t, completed: Boolean(t.completed) })),
  };
}

export async function getActiveBetForUser(userId: number): Promise<BetWithTasks | null> {
  const client = getClient();

  const { data: bet, error: betError } = await client
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (betError) {
    if (betError.code === 'PGRST116') return null;
    throw betError;
  }

  const { data: tasks, error: taskError } = await client
    .from('tasks')
    .select('*')
    .eq('bet_id', bet.id);

  if (taskError) throw taskError;

  return {
    ...bet,
    tasks: (tasks || []).map((t: Task) => ({ ...t, completed: Boolean(t.completed) })),
  };
}

export async function getBetsForUser(userId: number): Promise<BetWithTasks[]> {
  const client = getClient();

  const { data: bets, error: betError } = await client
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (betError) throw betError;
  if (!bets || bets.length === 0) return [];

  const betIds = bets.map(b => b.id);
  const { data: tasks, error: taskError } = await client
    .from('tasks')
    .select('*')
    .in('bet_id', betIds);

  if (taskError) throw taskError;

  return bets.map(bet => ({
    ...bet,
    tasks: (tasks || [])
      .filter((t: Task) => t.bet_id === bet.id)
      .map((t: Task) => ({ ...t, completed: Boolean(t.completed) })),
  }));
}

export async function updateBetStatus(betId: number, status: Bet['status']): Promise<void> {
  const { error } = await getClient()
    .from('bets')
    .update({ status })
    .eq('id', betId);

  if (error) throw error;
}

// Task operations
export async function completeTask(taskId: number): Promise<Task | null> {
  const { data, error } = await getClient()
    .from('tasks')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data ? { ...data, completed: Boolean(data.completed) } : null;
}

export async function getTaskById(taskId: number): Promise<Task | null> {
  const { data, error } = await getClient()
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? { ...data, completed: Boolean(data.completed) } : null;
}

// Get expired pending bets
export async function getExpiredPendingBets(): Promise<BetWithTasks[]> {
  const client = getClient();

  const { data: bets, error: betError } = await client
    .from('bets')
    .select('*')
    .eq('status', 'pending')
    .lt('deadline', new Date().toISOString());

  if (betError) throw betError;
  if (!bets || bets.length === 0) return [];

  const betIds = bets.map(b => b.id);
  const { data: tasks, error: taskError } = await client
    .from('tasks')
    .select('*')
    .in('bet_id', betIds);

  if (taskError) throw taskError;

  return bets.map(bet => ({
    ...bet,
    tasks: (tasks || [])
      .filter((t: Task) => t.bet_id === bet.id)
      .map((t: Task) => ({ ...t, completed: Boolean(t.completed) })),
  }));
}

// Charity operations
export async function getCharities(options?: {
  category?: Charity['category'];
  isControversial?: boolean;
  activeOnly?: boolean;
}): Promise<Charity[]> {
  const client = getClient();
  let query = client.from('charities').select('*');

  if (options?.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.isControversial !== undefined) {
    query = query.eq('is_controversial', options.isControversial);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCharityById(id: number): Promise<Charity | null> {
  const { data, error } = await getClient()
    .from('charities')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createCharity(charityData: {
  name: string;
  description: string;
  category: Charity['category'];
  logo_url?: string;
  website_url?: string;
  ein?: string;
  stripe_connect_account_id?: string;
  is_controversial?: boolean;
}): Promise<Charity> {
  const { data, error } = await getClient()
    .from('charities')
    .insert({
      name: charityData.name,
      description: charityData.description,
      category: charityData.category,
      logo_url: charityData.logo_url || null,
      website_url: charityData.website_url || null,
      ein: charityData.ein || null,
      stripe_connect_account_id: charityData.stripe_connect_account_id || null,
      is_controversial: charityData.is_controversial || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function searchCharities(searchQuery: string): Promise<Charity[]> {
  const { data, error } = await getClient()
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Donation operations
export async function createDonation(donationData: {
  bet_id: number;
  charity_id: number;
  user_id: number;
  amount: number;
}): Promise<Donation> {
  const { data, error } = await getClient()
    .from('donations')
    .insert(donationData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDonationById(id: number): Promise<Donation | null> {
  const { data, error } = await getClient()
    .from('donations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getDonationByBetId(betId: number): Promise<Donation | null> {
  const { data, error } = await getClient()
    .from('donations')
    .select('*')
    .eq('bet_id', betId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateDonationStatus(
  donationId: number,
  status: Donation['status'],
  stripeTransferId?: string,
  failureReason?: string
): Promise<void> {
  const { error } = await getClient()
    .from('donations')
    .update({
      status,
      stripe_transfer_id: stripeTransferId || null,
      failure_reason: failureReason || null,
    })
    .eq('id', donationId);

  if (error) throw error;
}

export async function getDonationsForUser(userId: number): Promise<Donation[]> {
  const { data, error } = await getClient()
    .from('donations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDonationsForCharity(charityId: number): Promise<Donation[]> {
  const { data, error } = await getClient()
    .from('donations')
    .select('*')
    .eq('charity_id', charityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
