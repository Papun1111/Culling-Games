"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaUserCircle, FaSkull, FaExclamationTriangle } from "react-icons/fa";

export default function ProfilePage() {
  const { user, fetchUserData, tasks, inventory, isLoading } = useGameStore();

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) return null;

  // --- 1. CALCULATE RANK ---
  const getRank = (points) => {
    if (points >= 1000) return "Special Grade";
    if (points >= 500) return "Grade 1";
    if (points >= 200) return "Grade 2";
    if (points >= 50) return "Grade 3";
    return "Grade 4";
  };

  // --- 2. CALCULATE 19-DAY DEADLINE ---
  // If user has never done a task, use their joined date.
  const lastActiveDate = user.updatedAt || user.createdAt;
  const deadlineDate = new Date(lastActiveDate);
  deadlineDate.setDate(deadlineDate.getDate() + 19); // Add 19 days
  
  const today = new Date();
  const timeDiff = deadlineDate - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Visual urgency state
  const isUrgent = daysLeft <= 3;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Profile Header */}
      <Card className="flex items-center gap-4 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f]">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-500">
            {user.image ? (
                <img src={user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
                <FaUserCircle className="text-4xl text-gray-400" />
            )}
        </div>
        <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-purple-400 font-mono text-sm uppercase tracking-widest">
                {getRank(user.points)} SORCERER
            </p>
        </div>
      </Card>

      {/* 2. THE 19-DAY TIMER (Kogane Alert) */}
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden ${
            isUrgent 
                ? "bg-red-900/20 border-red-500 animate-pulse" 
                : "bg-blue-900/10 border-blue-900"
        }`}
      >
        <div className="absolute top-2 right-2 opacity-50">
            <FaExclamationTriangle className={isUrgent ? "text-red-500" : "text-blue-500"} />
        </div>

        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Technique Removal Deadline</h3>
        <div className="text-5xl font-black text-white font-mono">
            {daysLeft} <span className="text-lg text-gray-500">DAYS</span>
        </div>
        <p className="text-xs text-gray-400 max-w-xs">
            {isUrgent 
                ? "WARNING: Score points immediately to reset the timer."
                : "Complete a task to reset this timer back to 19 days."}
        </p>
      </motion.div>

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Score */}
        <Card className="p-4 flex flex-col justify-between h-32">
            <span className="text-gray-500 text-xs uppercase font-bold">Total Points</span>
            <div className="text-3xl font-bold text-yellow-400">{user.points}</div>
            <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                    className="bg-yellow-500 h-full" 
                    style={{ width: `${Math.min(user.points / 10, 100)}%` }} 
                />
            </div>
        </Card>

        {/* Cursed Energy */}
        <Card className="p-4 flex flex-col justify-between h-32">
            <span className="text-gray-500 text-xs uppercase font-bold">Cursed Energy</span>
            <div className="text-3xl font-bold text-purple-400">
                {user.cursedEnergy} <span className="text-sm text-gray-600">/ {user.maxEnergy}</span>
            </div>
             <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                    className="bg-purple-500 h-full transition-all duration-500" 
                    style={{ width: `${(user.cursedEnergy / user.maxEnergy) * 100}%` }} 
                />
            </div>
        </Card>

        {/* Tasks Stats */}
        <Card className="p-4 bg-[#111]">
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <div className="text-xs text-gray-500">Active Missions</div>
        </Card>

        {/* Inventory Stats */}
        <Card className="p-4 bg-[#111]">
            <div className="text-2xl font-bold text-white">{inventory.length}</div>
            <div className="text-xs text-gray-500">Shikigami Owned</div>
        </Card>
      </div>

      {/* 4. Danger Zone */}
      <div className="pt-4">
        <Button 
            variant="ghost" 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-900/10 hover:text-red-400"
        >
            <FaSignOutAlt /> Retire from Culling Game (Logout)
        </Button>
      </div>
    </div>
  );
}