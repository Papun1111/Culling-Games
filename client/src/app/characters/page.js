"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRarityColor, getRarityGradient } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaSearch, FaTimes, FaFistRaised, FaShieldAlt, FaHeart } from "react-icons/fa";
import Link from "next/link";

const FILTERS = ["ALL", "UR", "SSR", "SR", "R"];

export default function CharactersPage() {
  const { inventory, fetchInventory, isLoading } = useGameStore();
  
  // UI State
  const [filter, setFilter] = useState("ALL");
  const [selectedChar, setSelectedChar] = useState(null); // For the modal

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter Logic
  const filteredInventory = inventory.filter((item) => {
    if (filter === "ALL") return true;
    return item.character.rarity === filter;
  });

  // Calculate Total Team Power
  const totalPower = inventory.reduce((acc, item) => {
    return acc + (item.character.baseAtk * item.level) + (item.character.baseHp * item.level);
  }, 0);

  return (
    <div className="space-y-6 pb-20 relative">
      {/* 1. Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Registry
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your contracted Sorcerers and Spirits.
          </p>
        </div>
        
        <Card className="px-4 py-2 bg-blue-900/10 border-blue-500/30 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                <FaFistRaised />
            </div>
            <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Total Combat Power</p>
                <p className="text-xl font-mono font-bold text-white">{totalPower.toLocaleString()}</p>
            </div>
        </Card>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FaFilter className="text-gray-600 mr-2 shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              filter === f
                ? "bg-white text-black border-white"
                : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"
            }`}
          >
            {f === "ALL" ? "All Grades" : `${f} Grade`}
          </button>
        ))}
      </div>

      {/* 3. The Grid */}
      {inventory.length === 0 && !isLoading ? (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-xl space-y-4">
            <p className="text-gray-500">Your registry is empty.</p>
            <Link href="/gacha">
                <Button variant="gacha">Go to Summoning</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
                {filteredInventory.map((userChar) => (
                    <motion.div
                        key={userChar.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setSelectedChar(userChar)}
                        className="cursor-pointer"
                    >
                        <CharacterCard 
                            character={userChar.character} 
                            userChar={userChar} 
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      )}

      {/* 4. Detail Modal (Overlay) */}
      <AnimatePresence>
        {selectedChar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="relative w-full max-w-sm bg-[#1a1a1a] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Modal Header (Rarity Color Background) */}
                    <div className={`h-32 w-full relative flex items-center justify-center ${getRarityGradient(selectedChar.character.rarity)}`}>
                        <button 
                            onClick={() => setSelectedChar(null)}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                        <h2 className="text-4xl font-black text-white/20 tracking-widest uppercase">
                            {selectedChar.character.rarity}
                        </h2>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 space-y-6 -mt-10 relative">
                        {/* Title Card */}
                        <div className="bg-[#111] border border-[#333] p-4 rounded-xl text-center shadow-lg">
                            <h3 className={`text-xl font-bold ${getRarityColor(selectedChar.character.rarity)}`}>
                                {selectedChar.character.name}
                            </h3>
                            <p className="text-xs text-gray-500 uppercase mt-1">Level {selectedChar.level} • {selectedChar.duplicates} Duplicates</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222]">
                                <FaHeart className="text-red-500 mx-auto mb-1 text-sm" />
                                <div className="font-bold text-white">{selectedChar.character.baseHp * selectedChar.level}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Health</div>
                            </div>
                            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222]">
                                <FaFistRaised className="text-yellow-500 mx-auto mb-1 text-sm" />
                                <div className="font-bold text-white">{selectedChar.character.baseAtk * selectedChar.level}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Attack</div>
                            </div>
                            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222]">
                                <FaShieldAlt className="text-blue-500 mx-auto mb-1 text-sm" />
                                <div className="font-bold text-white">{selectedChar.character.baseDef * selectedChar.level}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Defense</div>
                            </div>
                        </div>

                        {/* Speed Stat (Row) */}
                        <div className="flex items-center justify-between bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#222]">
                            <span className="text-xs text-gray-500 uppercase font-bold">Speed / Agility</span>
                            <span className="text-green-400 font-mono font-bold">{selectedChar.character.speed}</span>
                        </div>

                        <Button onClick={() => setSelectedChar(null)} variant="primary" className="w-full">
                            Close Dossier
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}