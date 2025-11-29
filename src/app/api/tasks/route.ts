import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { completeTask, getTaskById, getBetById, updateBetStatus } from '@/lib/db';
import { z } from 'zod';

const completeTaskSchema = z.object({
  taskId: z.number(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = completeTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { taskId } = result.data;

    // Get the task and verify ownership
    const task = getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const bet = getBetById(task.bet_id);
    if (!bet || bet.user_id !== session.userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if bet is still pending
    if (bet.status !== 'pending') {
      return NextResponse.json(
        { error: 'This bet is no longer active' },
        { status: 400 }
      );
    }

    // Check if deadline has passed
    if (new Date(bet.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'The deadline has passed' },
        { status: 400 }
      );
    }

    // Complete the task
    const updatedTask = completeTask(taskId);

    // Check if all tasks are now complete
    const updatedBet = getBetById(bet.id)!;
    const allComplete = updatedBet.tasks.every(t => t.completed);

    if (allComplete) {
      // User won! Mark bet as won
      updateBetStatus(bet.id, 'won');
    }

    return NextResponse.json({
      task: updatedTask,
      bet: getBetById(bet.id),
      allComplete,
    });
  } catch (error) {
    console.error('Complete task error:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}
