import prisma from '../config/db.js';

const SUMMON_COST = 100;

export const performSummon = async (userId) => {
  // 1. Check Balance
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.points < SUMMON_COST) {
    throw new Error("INSUFFICIENT_POINTS");
  }

  // 2. RNG Logic
  const rand = Math.random() * 100;
  let rarity = 'R';
  if (rand > 98) rarity = 'UR';       // 2%
  else if (rand > 85) rarity = 'SSR'; // 13%
  else if (rand > 55) rarity = 'SR';  // 30%
  else rarity = 'R';                  // 55%

  // 3. Fetch from Pool
  const pool = await prisma.character.findMany({ where: { rarity } });
  
  let character;
  if (pool.length === 0) {
     // Fallback for empty DB
     character = await prisma.character.create({
        data: { name: `Unknown Spirit (${rarity})`, rarity, baseHp: 100, baseAtk: 10 }
     });
  } else {
     character = pool[Math.floor(Math.random() * pool.length)];
  }

  // 4. Transaction
  return await prisma.$transaction(async (tx) => {
    // Deduct Points
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: SUMMON_COST } },
    });

    // Check Duplicate
    const existingChar = await tx.userCharacter.findFirst({
        where: { userId, characterId: character.id }
    });

    let userChar;
    if (existingChar) {
        // "Awakening" Mechanic
        userChar = await tx.userCharacter.update({
            where: { id: existingChar.id },
            data: { 
                duplicates: { increment: 1 },
                // Buff level on duplicate
                level: { increment: 1 } 
            }
        });
    } else {
        userChar = await tx.userCharacter.create({
            data: { userId, characterId: character.id }
        });
    }

    // Log History
    await tx.summonHistory.create({
      data: {
        userId,
        characterName: character.name,
        rarity: character.rarity,
      }
    });

    return { 
      character, 
      userPoints: updatedUser.points, 
      obtainedAt: userChar.obtainedAt,
      isNew: !existingChar 
    };
  });
};