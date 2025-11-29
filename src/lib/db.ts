import Database from 'better-sqlite3';
import path from 'path';
import type { User, Bet, Task, BetWithTasks } from '@/types';

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

  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost', 'processing')),
    consequence_type TEXT NOT NULL CHECK(consequence_type IN ('charity', 'friend')),
    consequence_target TEXT NOT NULL,
    consequence_message TEXT,
    stripe_payment_intent_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
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

  CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
  CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
  CREATE INDEX IF NOT EXISTS idx_bets_deadline ON bets(deadline);
  CREATE INDEX IF NOT EXISTS idx_tasks_bet_id ON tasks(bet_id);
`);

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
  tasks: string[]
): BetWithTasks {
  const insertBet = db.prepare(`
    INSERT INTO bets (user_id, amount, deadline, consequence_type, consequence_target, consequence_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertTask = db.prepare(`
    INSERT INTO tasks (bet_id, title)
    VALUES (?, ?)
  `);

  const transaction = db.transaction(() => {
    const betResult = insertBet.run(userId, amount, deadline, consequenceType, consequenceTarget, consequenceMessage);
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

export default db;
