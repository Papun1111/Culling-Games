import express from 'express';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';
import gachaRoutes from './gachaRoutes.js';
import colonyRoutes from './colonyRoutes.js';
import characterRoutes from './characterRoutes.js';
const router = express.Router();

router.get('/health', (req, res) => res.send('OK'));

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/gacha', gachaRoutes);
router.use('/colony', colonyRoutes);
router.use('/characters', characterRoutes);
export default router;