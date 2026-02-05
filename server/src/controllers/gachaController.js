import * as gachaService from '../services/gachaService.js';

export const summonCharacter = async (req, res) => {
  try {
    const result = await gachaService.performSummon(req.user.id);
    res.json(result);
  } catch (error) {
    if (error.message === "INSUFFICIENT_POINTS") {
        return res.status(400).json({ error: "Not enough points (Need 100)" });
    }
    console.error(error);
    res.status(500).json({ error: "Summon failed" });
  }
};