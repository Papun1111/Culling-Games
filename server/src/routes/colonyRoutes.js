import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { startPatrol, getBattleLogs } from '../controllers/colonyController.js';
const router = express.Router();

router.use(verifyToken);
router.post('/patrol', startPatrol);
router.get('/logs', getBattleLogs);
export default router;