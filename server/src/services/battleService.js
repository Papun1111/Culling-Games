import prisma from '../config/db.js';

export const simulateBattle = async (userId) => {
    const COST = 20;

    // 1. Fetch User & Team
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { characters: { include: { character: true } } } 
    });

    // 🛡️ FIX: Guard against Zombie Tokens (User deleted but browser still has token)
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    // 2. Validations
    if (user.cursedEnergy < COST) throw new Error("NO_ENERGY");
    if (user.characters.length === 0) throw new Error("NO_CHARACTERS");

    // 3. Calculate Team Power
    // We add a safety check (|| 0) just in case
    const totalAtk = user.characters.reduce((acc, c) => acc + ((c.character.baseAtk || 10) * c.level), 0);
    const totalHp = user.characters.reduce((acc, c) => acc + ((c.character.baseHp || 50) * c.level), 0);

    // 4. Simulate Turn-Based Battle
    const enemyHp = totalHp * (0.8 + Math.random() * 0.4); 
    const enemyAtk = totalAtk * (0.8 + Math.random() * 0.4);
    
    let battleLogs = [];
    let playerHp = totalHp;
    let currEnemyHp = enemyHp;
    let turn = 1;
    let result = "LOSS";

    while (playerHp > 0 && currEnemyHp > 0 && turn <= 10) {
        // Player Attacks
        const dmgDealt = Math.floor(totalAtk * (0.9 + Math.random() * 0.2));
        currEnemyHp -= dmgDealt;
        battleLogs.push({ 
            turn, 
            actor: user.name, 
            action: "ATTACK", 
            message: `${user.name}'s team dealt ${dmgDealt} damage!`,
            isCrit: dmgDealt > totalAtk 
        });

        if (currEnemyHp <= 0) {
            result = "WIN";
            break;
        }

        // Enemy Attacks
        const dmgTaken = Math.floor(enemyAtk * (0.8 + Math.random() * 0.3));
        playerHp -= dmgTaken;
        battleLogs.push({ 
            turn, 
            actor: "Special Grade Spirit", 
            action: "ATTACK", 
            message: `Enemy attacked for ${dmgTaken} damage!`,
            isCrit: false 
        });

        turn++;
    }

    const pointsEarned = result === "WIN" ? 100 : 10;

    // 5. Database Transaction
    // This will throw if the 'BattleLog' table doesn't exist
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { 
                cursedEnergy: { decrement: COST },
                points: { increment: pointsEarned }
            }
        }),
        prisma.battleLog.create({
            data: {
                userId,
                enemy: "Special Grade Spirit",
                result,
                logs: JSON.stringify(battleLogs)
            }
        })
    ]);

    return { result, pointsEarned, logs: JSON.stringify(battleLogs) };
};