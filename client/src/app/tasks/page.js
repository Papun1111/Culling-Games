"use client";

import { useState, useEffect, useMemo, useRef } from "react"; // 1. Add useRef
import { useGameStore } from "@/store/useGameStore";
import { TaskCard } from "@/components/game/TaskCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AnimatePresence, motion } from "framer-motion";
import { FaPlus, FaTasks } from "react-icons/fa";

// ... (Keep the DIFFICULTIES array same as before) ...
const DIFFICULTIES = [
  { value: "GRADE_4", label: "Grade 4 (Easy)", points: 10 },
  { value: "GRADE_3", label: "Grade 3 (Normal)", points: 20 },
  { value: "GRADE_2", label: "Grade 2 (Hard)", points: 50 },
  { value: "GRADE_1", label: "Grade 1 (Expert)", points: 100 },
  { value: "SPECIAL", label: "Special Grade (Epic)", points: 200 },
];


export default function TasksPage() {
  const tasks = useGameStore((state) => state.tasks);
  const fetchTasks = useGameStore((state) => state.fetchTasks);
  const createTask = useGameStore((state) => state.createTask);
  const completeTask = useGameStore((state) => state.completeTask);
  const deleteTask = useGameStore((state) => state.deleteTask);
  
  // Local Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("GRADE_4");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 FIX: Use useRef to track if we have fetched.
  // changing .current does NOT trigger a re-render, solving the error.
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchTasks();
      hasFetched.current = true;
    }
  }, [fetchTasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await createTask(title, difficulty);
    setTitle("");
    setIsSubmitting(false);
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });
  }, [tasks]);

  return (
    // ... (Keep the exact same JSX return as before) ...
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-blue-500"><FaTasks /></span>
            Kogane Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Complete real-world missions to earn points for the Culling Game.
          </p>
        </div>
      </div>

      {/* 2. Add Task Form */}
      <Card className="bg-[#111] border-blue-900/30">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mission Objective</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish React Project documentation..."
              className="bg-[#0a0a0a]"
            />
          </div>

          <div className="w-full md:w-64 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty Grade</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label} (+{diff.points} pts)
                </option>
              ))}
            </select>
          </div>

          <Button 
            type="submit" 
            isLoading={isSubmitting} 
            disabled={!title.trim()}
            className="w-full md:w-auto"
          >
            <FaPlus /> Add Mission
          </Button>
        </form>
      </Card>

      {/* 3. Task List */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Active Missions</h2>
        
        {tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl"
          >
            <p>No active missions.</p>
            <p className="text-sm">The Culling Game awaits your participation.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={completeTask}
                onDelete={deleteTask}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

