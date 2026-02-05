import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { summonCharacter } from '../controllers/gachaController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/summon', summonCharacter);

export default router;