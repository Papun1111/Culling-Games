// server/prisma/seed.js
import prisma from '../src/config/db.js';

async function main() {
  // Check if data exists first
  const count = await prisma.character.count();
  if (count > 0) {
    console.log('⚠️ Database already seeded. Skipping...');
    return;
  }

  const characters = [
    // Added 'baseDef' (Defense) to all characters
    { name: 'Yuji Itadori', rarity: 'SR', baseHp: 120, baseAtk: 40, baseDef: 30, speed: 60 },
    { name: 'Megumi Fushiguro', rarity: 'SR', baseHp: 110, baseAtk: 45, baseDef: 25, speed: 55 },
    { name: 'Nobara Kugisaki', rarity: 'SR', baseHp: 100, baseAtk: 50, baseDef: 20, speed: 50 },
    { name: 'Satoru Gojo', rarity: 'UR', baseHp: 500, baseAtk: 999, baseDef: 999, speed: 100 },
    { name: 'Ryomen Sukuna', rarity: 'UR', baseHp: 450, baseAtk: 950, baseDef: 900, speed: 95 },
    { name: 'Kento Nanami', rarity: 'SSR', baseHp: 150, baseAtk: 70, baseDef: 60, speed: 50 },
    { name: 'Panda', rarity: 'R', baseHp: 140, baseAtk: 30, baseDef: 50, speed: 40 },
    { name: 'Maki Zenin', rarity: 'SSR', baseHp: 130, baseAtk: 80, baseDef: 40, speed: 85 },
  ];

  for (const char of characters) {
    await prisma.character.create({ data: char });
  }
  console.log('✅ Culling Game Players Added');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());