import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getAllCharacters, getMyCharacters } from '../controllers/characterController.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', getAllCharacters);
router.get('/me', getMyCharacters);

export default router;