import Database from 'better-sqlite3';
import path from 'path';
import type { User, Bet, Task, BetWithTasks, Charity, Donation } from '@/types';
import { SEED_CHARITIES } from './seed-charities';

// Raw database types (SQLite stores booleans as integers)
interface CharityRow {
  id: number;
  name: string;
  description: string;
  category: Charity['category'];
  logo_url: string | null;
  website_url: string | null;
  ein: string | null;
  stripe_connect_account_id: string | null;
  is_active: number;
  is_controversial: number;
  created_at: string;
}

function charityRowToCharity(row: CharityRow): Charity {
  return {
    ...row,
    is_active: Boolean(row.is_active),
    is_controversial: Boolean(row.is_controversial),
  };
}

const dbPath = path.join(process.cwd(), 'morning-bet.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS charities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('political_left', 'political_right', 'environmental', 'sports', 'social', 'religious', 'other')),
    logo_url TEXT,
    website_url TEXT,
    ein TEXT,
    stripe_connect_account_id TEXT,
    is_active INTEGER DEFAULT 1,
    is_controversial INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost', 'processing')),
    consequence_type TEXT NOT NULL CHECK(consequence_type IN ('charity', 'friend')),
    consequence_target TEXT NOT NULL,
    consequence_message TEXT,
    charity_id INTEGER,
    stripe_payment_intent_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (charity_id) REFERENCES charities(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bet_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (bet_id) REFERENCES bets(id)
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bet_id INTEGER NOT NULL,
    charity_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    stripe_transfer_id TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
    failure_reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (bet_id) REFERENCES bets(id),
    FOREIGN KEY (charity_id) REFERENCES charities(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
  CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
  CREATE INDEX IF NOT EXISTS idx_bets_deadline ON bets(deadline);
  CREATE INDEX IF NOT EXISTS idx_bets_charity_id ON bets(charity_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_bet_id ON tasks(bet_id);
  CREATE INDEX IF NOT EXISTS idx_charities_category ON charities(category);
  CREATE INDEX IF NOT EXISTS idx_charities_is_active ON charities(is_active);
  CREATE INDEX IF NOT EXISTS idx_donations_bet_id ON donations(bet_id);
  CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);
  CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
`);

// Seed charities if table is empty
function seedCharitiesIfEmpty() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM charities');
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO charities (name, description, category, logo_url, website_url, ein, stripe_connect_account_id, is_active, is_controversial)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((charities: typeof SEED_CHARITIES) => {
      for (const charity of charities) {
        insertStmt.run(
          charity.name,
          charity.description,
          charity.category,
          charity.logo_url,
          charity.website_url,
          charity.ein,
          charity.stripe_connect_account_id,
          charity.is_active ? 1 : 0,
          charity.is_controversial ? 1 : 0
        );
      }
    });

    insertMany(SEED_CHARITIES.filter(c => c.is_active));
    console.log(`Seeded ${SEED_CHARITIES.filter(c => c.is_active).length} charities into database`);
  }
}

seedCharitiesIfEmpty();

// User operations
export function createUser(email: string, name: string, passwordHash: string): User {
  const stmt = db.prepare(`
    INSERT INTO users (email, name, password_hash)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(email, name, passwordHash);
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function updateUserStripeCustomerId(userId: number, stripeCustomerId: string): void {
  const stmt = db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?');
  stmt.run(stripeCustomerId, userId);
}

// Bet operations
export function createBet(
  userId: number,
  amount: number,
  deadline: string,
  consequenceType: 'charity' | 'friend',
  consequenceTarget: string,
  consequenceMessage: string | null,
  tasks: string[],
  charityId: number | null = null
): BetWithTasks {
  const insertBet = db.prepare(`
    INSERT INTO bets (user_id, amount, deadline, consequence_type, consequence_target, consequence_message, charity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTask = db.prepare(`
    INSERT INTO tasks (bet_id, title)
    VALUES (?, ?)
  `);

  const transaction = db.transaction(() => {
    const betResult = insertBet.run(userId, amount, deadline, consequenceType, consequenceTarget, consequenceMessage, charityId);
    const betId = betResult.lastInsertRowid as number;

    for (const taskTitle of tasks) {
      insertTask.run(betId, taskTitle);
    }

    return getBetById(betId)!;
  });

  return transaction();
}

export function getBetById(id: number): BetWithTasks | undefined {
  const betStmt = db.prepare('SELECT * FROM bets WHERE id = ?');
  const bet = betStmt.get(id) as Bet | undefined;

  if (!bet) return undefined;

  const tasksStmt = db.prepare('SELECT * FROM tasks WHERE bet_id = ?');
  const tasks = tasksStmt.all(id) as Task[];

  return { ...bet, tasks: tasks.map(t => ({ ...t, completed: Boolean(t.completed) })) };
}

export function getActiveBetForUser(userId: number): BetWithTasks | undefined {
  const stmt = db.prepare(`
    SELECT * FROM bets
    WHERE user_id = ? AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `);
  const bet = stmt.get(userId) as Bet | undefined;

  if (!bet) return undefined;

  const tasksStmt = db.prepare('SELECT * FROM tasks WHERE bet_id = ?');
  const tasks = tasksStmt.all(bet.id) as Task[];

  return { ...bet, tasks: tasks.map(t => ({ ...t, completed: Boolean(t.completed) })) };
}

export function getBetsForUser(userId: number): BetWithTasks[] {
  const stmt = db.prepare('SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC');
  const bets = stmt.all(userId) as Bet[];

  return bets.map(bet => {
    const tasksStmt = db.prepare('SELECT * FROM tasks WHERE bet_id = ?');
    const tasks = tasksStmt.all(bet.id) as Task[];
    return { ...bet, tasks: tasks.map(t => ({ ...t, completed: Boolean(t.completed) })) };
  });
}

export function updateBetStatus(betId: number, status: Bet['status']): void {
  const stmt = db.prepare('UPDATE bets SET status = ? WHERE id = ?');
  stmt.run(status, betId);
}

export function updateBetPaymentIntent(betId: number, paymentIntentId: string): void {
  const stmt = db.prepare('UPDATE bets SET stripe_payment_intent_id = ? WHERE id = ?');
  stmt.run(paymentIntentId, betId);
}

// Task operations
export function completeTask(taskId: number): Task | undefined {
  const stmt = db.prepare(`
    UPDATE tasks
    SET completed = 1, completed_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(taskId);

  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = getStmt.get(taskId) as Task | undefined;
  return task ? { ...task, completed: Boolean(task.completed) } : undefined;
}

export function getTaskById(taskId: number): Task | undefined {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = stmt.get(taskId) as Task | undefined;
  return task ? { ...task, completed: Boolean(task.completed) } : undefined;
}

// Get all pending bets past their deadline
export function getExpiredPendingBets(): BetWithTasks[] {
  const stmt = db.prepare(`
    SELECT * FROM bets
    WHERE status = 'pending' AND deadline < datetime('now')
  `);
  const bets = stmt.all() as Bet[];

  return bets.map(bet => {
    const tasksStmt = db.prepare('SELECT * FROM tasks WHERE bet_id = ?');
    const tasks = tasksStmt.all(bet.id) as Task[];
    return { ...bet, tasks: tasks.map(t => ({ ...t, completed: Boolean(t.completed) })) };
  });
}

// Charity operations
export function getCharities(options?: {
  category?: Charity['category'];
  isControversial?: boolean;
  activeOnly?: boolean;
}): Charity[] {
  let query = 'SELECT * FROM charities WHERE 1=1';
  const params: (string | number)[] = [];

  if (options?.activeOnly !== false) {
    query += ' AND is_active = 1';
  }

  if (options?.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }

  if (options?.isControversial !== undefined) {
    query += ' AND is_controversial = ?';
    params.push(options.isControversial ? 1 : 0);
  }

  query += ' ORDER BY name ASC';

  const stmt = db.prepare(query);
  const charities = stmt.all(...params) as CharityRow[];

  return charities.map(charityRowToCharity);
}

export function getCharityById(id: number): Charity | undefined {
  const stmt = db.prepare('SELECT * FROM charities WHERE id = ?');
  const charity = stmt.get(id) as CharityRow | undefined;

  if (!charity) return undefined;

  return charityRowToCharity(charity);
}

export function createCharity(data: {
  name: string;
  description: string;
  category: Charity['category'];
  logo_url?: string;
  website_url?: string;
  ein?: string;
  stripe_connect_account_id?: string;
  is_controversial?: boolean;
}): Charity {
  const stmt = db.prepare(`
    INSERT INTO charities (name, description, category, logo_url, website_url, ein, stripe_connect_account_id, is_controversial)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.description,
    data.category,
    data.logo_url || null,
    data.website_url || null,
    data.ein || null,
    data.stripe_connect_account_id || null,
    data.is_controversial ? 1 : 0
  );
  return getCharityById(result.lastInsertRowid as number)!;
}

export function searchCharities(query: string): Charity[] {
  const stmt = db.prepare(`
    SELECT * FROM charities
    WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?)
    ORDER BY name ASC
  `);
  const searchPattern = `%${query}%`;
  const charities = stmt.all(searchPattern, searchPattern) as CharityRow[];

  return charities.map(charityRowToCharity);
}

// Donation operations
export function createDonation(data: {
  bet_id: number;
  charity_id: number;
  user_id: number;
  amount: number;
}): Donation {
  const stmt = db.prepare(`
    INSERT INTO donations (bet_id, charity_id, user_id, amount)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(data.bet_id, data.charity_id, data.user_id, data.amount);
  return getDonationById(result.lastInsertRowid as number)!;
}

export function getDonationById(id: number): Donation | undefined {
  const stmt = db.prepare('SELECT * FROM donations WHERE id = ?');
  return stmt.get(id) as Donation | undefined;
}

export function getDonationByBetId(betId: number): Donation | undefined {
  const stmt = db.prepare('SELECT * FROM donations WHERE bet_id = ?');
  return stmt.get(betId) as Donation | undefined;
}

export function updateDonationStatus(
  donationId: number,
  status: Donation['status'],
  stripeTransferId?: string,
  failureReason?: string
): void {
  const stmt = db.prepare(`
    UPDATE donations
    SET status = ?, stripe_transfer_id = ?, failure_reason = ?
    WHERE id = ?
  `);
  stmt.run(status, stripeTransferId || null, failureReason || null, donationId);
}

export function getDonationsForUser(userId: number): Donation[] {
  const stmt = db.prepare('SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Donation[];
}

export function getDonationsForCharity(charityId: number): Donation[] {
  const stmt = db.prepare('SELECT * FROM donations WHERE charity_id = ? ORDER BY created_at DESC');
  return stmt.all(charityId) as Donation[];
}

export default db;
