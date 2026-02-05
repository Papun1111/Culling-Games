import prisma from '../config/db.js';

// GET /api/characters (Public Wiki)
export const getAllCharacters = async (req, res) => {
  try {
    const characters = await prisma.character.findMany();
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch character list" });
  }
};

// GET /api/characters/me (My Inventory)
export const getMyCharacters = async (req, res) => {
  try {
    const userChars = await prisma.userCharacter.findMany({
      where: { userId: req.user.id },
      include: { character: true }, // Join with Character data
    });
    res.json(userChars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};