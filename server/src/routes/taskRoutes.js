import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getTasks, createTask, completeTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

// All task routes require authentication
router.use(verifyToken);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

export default router;