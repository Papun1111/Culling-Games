/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRarityColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaSkull, FaTrophy, FaHistory, FaPlay } from "react-icons/fa";

export default function ColonyPage() {
  const { user, startPatrol, fetchBattleLogs, battleLogs, isLoading } = useGameStore();
  
  // Battle State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]); // The full log from server
  const [displayLogs, setDisplayLogs] = useState([]); // What we show on screen (grows over time)
  const [battleResult, setBattleResult] = useState(null); // WIN/LOSS data
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const bottomRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    fetchBattleLogs();
  }, []);

  // 🎬 The Playback Engine
  useEffect(() => {
    let interval;
    if (isPlaying && playbackIndex < currentLogs.length) {
      interval = setInterval(() => {
        setDisplayLogs((prev) => [...prev, currentLogs[playbackIndex]]);
        setPlaybackIndex((prev) => prev + 1);
        
        // Auto-scroll to bottom
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 800); // 0.8s per turn
    } else if (isPlaying && playbackIndex >= currentLogs.length) {
      // Battle Finished
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackIndex, currentLogs]);

  const handlePatrol = async () => {
    if (user.cursedEnergy < 20) {
      alert("Not enough Cursed Energy!");
      return;
    }

    // Reset State
    setDisplayLogs([]);
    setPlaybackIndex(0);
    setBattleResult(null);

    try {
      // 1. Get Simulation Result
      const data = await startPatrol();
      
      // 2. Start Playback
      setCurrentLogs(JSON.parse(data.logs)); // Backend sends stringified JSON for logs
      setBattleResult({ result: data.result, points: data.pointsEarned });
      setIsPlaying(true);
    } catch (err) {
      console.error("Patrol failed", err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            TOKYO COLONY <span className="text-red-600">NO. 1</span>
          </h1>
          <p className="text-gray-400 text-xs">WARNING: Special Grade Spirits detected.</p>
        </div>
        
        {/* Energy Display */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xl">
            <FaBolt /> {user?.cursedEnergy || 0}/{user?.maxEnergy || 100}
          </div>
          <span className="text-[10px] text-gray-500 uppercase">Cursed Energy</span>
        </div>
      </div>

      {/* 2. The Battle Monitor (Main Stage) */}
      <Card className="min-h-[400px] flex flex-col relative overflow-hidden border-2 border-[#333] bg-black">
        
        {/* A. Idle State */}
        {!isPlaying && displayLogs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 z-10 bg-[url('/grid-pattern.png')]">
            <div className="w-32 h-32 rounded-full bg-red-900/20 flex items-center justify-center animate-pulse">
              <FaSkull className="text-6xl text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">AREA SECURE</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Expend 20 CE to patrol the colony. Your team will auto-engage any threats.
              </p>
            </div>
            <Button 
              onClick={handlePatrol} 
              disabled={isLoading || user?.cursedEnergy < 20}
              variant="danger" 
              className="px-8 py-4 text-lg"
            >
              {isLoading ? "CALCULATING..." : "START PATROL (-20 CE)"}
            </Button>
          </div>
        )}

        {/* B. Battle Log (Playback) */}
        {(isPlaying || displayLogs.length > 0) && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px]">
            {displayLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border-l-4 text-sm font-mono ${
                  log.action === "ATTACK" && log.actor === "Special Grade Spirit"
                    ? "bg-red-900/20 border-red-600 text-red-200" // Enemy Attack
                    : "bg-blue-900/20 border-blue-500 text-blue-200" // Ally Attack
                }`}
              >
                <div className="flex justify-between">
                    <span className="font-bold">{log.actor}</span>
                    <span className="text-xs opacity-50">Turn {log.turn}</span>
                </div>
                <p className="mt-1">{log.message}</p>
                {log.isCrit && <span className="text-yellow-400 font-bold text-xs">CRITICAL HIT!</span>}
              </motion.div>
            ))}
            
            {/* C. Battle Result (End Screen) */}
            {!isPlaying && battleResult && (
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="mt-8 p-6 bg-[#1a1a1a] border border-gray-700 rounded-xl text-center space-y-4"
               >
                 {battleResult.result === "WIN" ? (
                    <>
                        <FaTrophy className="text-5xl text-yellow-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">CURSE EXORCISED</h2>
                        <p className="text-green-400">Gained +{battleResult.points} Points</p>
                    </>
                 ) : (
                    <>
                        <FaSkull className="text-5xl text-gray-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-400">RETREAT</h2>
                        <p className="text-gray-500">You were overwhelmed.</p>
                    </>
                 )}
                 <Button onClick={() => { setDisplayLogs([]); setBattleResult(null); }} variant="primary">
                    RETURN TO BASE
                 </Button>
               </motion.div>
            )}
            
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      {/* 3. History Log */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaHistory /> Patrol Logs
        </h3>
        <div className="space-y-2">
            {battleLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-[#111] rounded border border-[#222]">
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${log.result === 'WIN' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                            {log.result}
                        </span>
                        <span className="text-sm text-gray-400">{log.enemy}</span>
                    </div>
                    <span className="text-xs text-gray-600">
                        {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                </div>
            ))}
            {battleLogs.length === 0 && <p className="text-gray-600 text-sm">No patrols recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}