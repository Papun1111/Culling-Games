import { motion } from "motion/react";
import { getRarityColor, getRarityGradient } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const CharacterCard = ({ character, userChar }) => {
  const { name, rarity, baseAtk, baseHp } = character;
  const level = userChar?.level || 1;
  const duplicates = userChar?.duplicates || 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 p-1 bg-[#1a1a1a] flex flex-col items-center",
        getRarityColor(rarity) // Applies Border Color based on rarity
      )}
    >
      {/* Character Image Placeholder */}
      <div className={cn("w-full h-32 mb-2 rounded-lg flex items-center justify-center text-4xl font-bold text-white/20", getRarityGradient(rarity))}>
        {name[0]}
      </div>

      {/* Info */}
      <div className="w-full text-center">
        <h3 className="font-bold text-sm truncate text-white">{name}</h3>
        <p className={cn("text-xs font-bold mb-2", getRarityColor(rarity))}>{rarity} Grade</p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1 text-[10px] bg-black/40 p-2 rounded text-gray-400">
            <div>LVL {level}</div>
            <div>Dupes: {duplicates}</div>
            <div>HP: {baseHp * level}</div>
            <div>ATK: {baseAtk * level}</div>
        </div>
      </div>
    </motion.div>
  );
};