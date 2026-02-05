import prisma from '../config/db.js';

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, difficulty } = req.body;
    
    // Simple point logic based on difficulty
    const pointsMap = {
      'GRADE_4': 10,
      'GRADE_3': 20,
      'GRADE_2': 50,
      'GRADE_1': 100,
      'SPECIAL': 200
    };

    const task = await prisma.task.create({
      data: {
        userId: req.user.id,
        title,
        difficulty: difficulty || 'GRADE_4',
        pointsReward: pointsMap[difficulty] || 10,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// PATCH /api/tasks/:id/complete
export const completeTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Transaction: Mark task complete AND add points to user
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id } });
      
      if (!task || task.userId !== req.user.id) {
        throw new Error('Task not found');
      }
      if (task.isCompleted) {
        throw new Error('Task already completed');
      }

      const updatedTask = await tx.task.update({
        where: { id },
        data: { isCompleted: true },
      });

      const updatedUser = await tx.user.update({
        where: { id: req.user.id },
        data: { points: { increment: task.pointsReward } },
      });

      return { task: updatedTask, userPoints: updatedUser.points };
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    await prisma.task.deleteMany({
      where: { 
        id: req.params.id,
        userId: req.user.id // Ensure ownership
      }
    });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete task" });
  }
};