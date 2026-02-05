import prisma from '../config/db.js';

export const simulateBattle = async (userId) => {
  const BATTLE_COST = 20;

  // 1. Validate User & Load Team
  const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { characters: { include: { character: true } } } 
  });

  if (user.cursedEnergy < BATTLE_COST) {
    throw new Error("NO_ENERGY");
  }

  // Select Top 3 Characters
  const team = user.characters
    .sort((a, b) => (b.character.baseAtk * b.level) - (a.character.baseAtk * a.level))
    .slice(0, 3)
    .map(c => ({
        name: c.character.name,
        hp: c.character.baseHp * c.level,
        atk: c.character.baseAtk * c.level,
    }));

  if (team.length === 0) throw new Error("NO_CHARACTERS");

  // 2. Generate Enemy
  const enemy = {
    name: "Special Grade Spirit",
    hp: 500 * (1 + (user.characters.length * 0.05)), // Scales slightly
    atk: 40,
  };

  // 3. Run Simulation (Instant)
  let logs = [];
  let turn = 1;
  let victory = false;

  while (turn <= 20) {
    // Player Team Attacks
    for (const char of team) {
        if (char.hp <= 0) continue;
        
        const isCrit = Math.random() < 0.15; // 15% crit
        const damage = Math.floor(char.atk * (isCrit ? 1.5 : 1.0));
        enemy.hp -= damage;

        logs.push({
            turn,
            actor: char.name,
            action: "ATTACK",
            target: enemy.name,
            value: damage,
            isCrit,
            message: `${char.name} hit ${enemy.name} for ${damage} damage!`
        });

        if (enemy.hp <= 0) {
            victory = true;
            break;
        }
    }
    if (victory) break;

    // Enemy Attacks Random Survivor
    const survivors = team.filter(c => c.hp > 0);
    if (survivors.length === 0) break;

    const target = survivors[Math.floor(Math.random() * survivors.length)];
    const enemyDmg = enemy.atk;
    target.hp -= enemyDmg;

    logs.push({
        turn,
        actor: enemy.name,
        action: "ATTACK",
        target: target.name,
        value: enemyDmg,
        message: `${enemy.name} attacked ${target.name} for ${enemyDmg} damage!`
    });

    if (team.every(c => c.hp <= 0)) break;
    turn++;
  }

  // 4. Save Results
  const result = victory ? "WIN" : "LOSS";
  const pointsEarned = victory ? 50 : 5;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
        where: { id: userId },
        data: { 
            cursedEnergy: { decrement: BATTLE_COST },
            points: { increment: pointsEarned }
        }
    });

    await tx.battleLog.create({
        data: {
            userId,
            colonyName: "Tokyo Colony No. 1",
            result,
            pointsEarned,
            enemy: enemy.name,
            logData: JSON.stringify(logs)
        }
    });
  });

  return { result, logs, pointsEarned };
};