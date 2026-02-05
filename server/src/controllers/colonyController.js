import prisma from '../config/db.js'; // 👈 CRITICAL FIX: Import Prisma
import * as battleService from '../services/battleService.js';

export const startPatrol = async (req, res) => {
    try {
        const result = await battleService.simulateBattle(req.user.id);
        res.json(result);
    } catch (error) {
        // 🛡️ FIX: Handle known errors specifically
        if (error.message === "USER_NOT_FOUND") {
            return res.status(401).json({ error: "User not found. Please log in again." });
        }
        if (error.message === "NO_ENERGY") {
            return res.status(400).json({ error: "Not enough Cursed Energy (-20 needed)" });
        }
        if (error.message === "NO_CHARACTERS") {
            return res.status(400).json({ error: "Summon a Sorcerer first! Your team is empty." });
        }
        
        // Log the REAL error to your terminal so you can see it
        console.error("⚠️ FATAL PATROL ERROR:", error); 
        res.status(500).json({ error: "Battle Simulation failed" });
    }
};
export const getBattleLogs = async (req, res) => {
    try {
        const logs = await prisma.battleLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20 // Increased history limit slightly
        });
        res.json(logs);
    } catch (error) {
        console.error("Get Logs Error:", error);
        res.status(500).json({ error: "Could not fetch logs" });
    }
};