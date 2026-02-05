"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Button } from "@/components/ui/Button";
import { getRarityColor, getRarityGradient } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FaDragon, FaHistory } from "react-icons/fa";

export default function GachaPage() {
  const { user, inventory, summonCharacter, fetchInventory, isLoading } = useGameStore();
  
  // UI State
  const [isAnimating, setIsAnimating] = useState(false);
  const [summonResult, setSummonResult] = useState(null);
  const [error, setError] = useState(null);

  // Load inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // 🛡️ CRITICAL FIX: Guard against Null User
  // If user data hasn't loaded yet, show a loading spinner instead of crashing.
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm animate-pulse">Synchronizing Cursed Energy...</p>
      </div>
    );
  }

  const handleSummon = async () => {
    // Now safe to access user.points because of the guard above
    if (user.points < 100) {
      setError("Insufficient Points! Complete more tasks.");
      return;
    }

    setError(null);
    setIsAnimating(true);
    setSummonResult(null);

    try {
      // 1. Trigger API Call
      const data = await summonCharacter();
      
      // 2. Wait for Animation (Artificial Delay for suspense)
      setTimeout(() => {
        setSummonResult(data.character);
        setIsAnimating(false);
      }, 2000); 

    } catch (err) {
      setIsAnimating(false);
      setError("Summon Failed. The curtain rejected you.");
    }
  };

  const resetSummon = () => {
    setSummonResult(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-600">
          DOMAIN EXPANSION
        </h1>
        <p className="text-gray-400">
          Spend <span className="text-yellow-400 font-bold">100 Points</span> to summon a Cursed Spirit or Sorcerer.
        </p>
      </div>

      {/* 2. The Summoning Stage */}
      <div className="relative w-full max-w-md mx-auto min-h-100 flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {/* STATE A: IDLE (Show Button) */}
          {!isAnimating && !summonResult && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="w-64 h-80 bg-gradient-to-b from-gray-800 to-black rounded-xl border-2 border-gray-700 flex items-center justify-center shadow-2xl">
                <FaDragon className="text-6xl text-gray-600" />
              </div>
              
              <Button 
                onClick={handleSummon}
                disabled={isLoading}
                variant="gacha" // Uses our custom purple variant
                className="w-full py-4 text-lg uppercase tracking-widest"
              >
                {isLoading ? "Channeling..." : "SUMMON (100 PTS)"}
              </Button>
              
              {error && (
                <p className="text-red-500 font-bold text-sm bg-red-900/20 px-4 py-2 rounded">
                  {error}
                </p>
              )}
            </motion.div>
          )}

          {/* STATE B: ANIMATING (The Void) */}
          {isAnimating && (
            <motion.div
              key="animating"
              className="absolute inset-0 flex items-center justify-center bg-black z-10 rounded-xl border border-purple-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-purple-400 font-mono animate-pulse">CONJURING TECHNIQUE...</p>
              </div>
            </motion.div>
          )}

          {/* STATE C: RESULT REVEAL */}
          {summonResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="relative z-20 text-center space-y-6"
            >
              {/* Flashy Background Effect based on Rarity */}
              <div className={`absolute inset-0 blur-3xl opacity-30 pointer-events-none ${getRarityGradient(summonResult.rarity)}`} />

              <div className="scale-125 transform">
                <CharacterCard character={summonResult} />
              </div>

              <div className="space-y-1">
                <h2 className={`text-2xl font-bold ${getRarityColor(summonResult.rarity)}`}>
                  {summonResult.name}
                </h2>
                <p className="text-white text-sm uppercase tracking-widest">{summonResult.rarity} CLASS OBTAINED</p>
              </div>

              <Button onClick={resetSummon} variant="primary" className="w-full">
                SUMMON AGAIN
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Recent Inventory (Preview) */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaHistory className="text-gray-500" />
          Your Collection ({inventory.length})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inventory.slice(0, 4).map((userChar,index) => (
            <CharacterCard 
              key={index} 
              character={userChar.character}
              userChar={userChar} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}