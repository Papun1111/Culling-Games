import * as battleService from '../services/battleService.js';

export const startPatrol = async (req, res) => {
    try {
        const result = await battleService.simulateBattle(req.user.id);
        res.json(result);
    } catch (error) {
        if (error.message === "NO_ENERGY") return res.status(400).json({ error: "Not enough Cursed Energy" });
        if (error.message === "NO_CHARACTERS") return res.status(400).json({ error: "Summon characters first!" });
        console.error(error);
        res.status(500).json({ error: "Battle Simulation failed" });
    }
};

export const getBattleLogs = async (req, res) => {
    try {
        const logs = await prisma.battleLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10 // Limit to last 10 battles
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch logs" });
    }
};