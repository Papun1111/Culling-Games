import { motion } from "framer-motion";
import { FaCheck, FaTrash } from "react-icons/fa";
import { cn } from "@/lib/utils";

const difficultyColors = {
  GRADE_4: "bg-gray-700 text-gray-300",
  GRADE_3: "bg-blue-900 text-blue-200",
  GRADE_2: "bg-green-900 text-green-200",
  GRADE_1: "bg-red-900 text-red-200",
  SPECIAL: "bg-purple-900 text-purple-200 border border-purple-500",
};

export const TaskCard = ({ task, onComplete, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={cn(
        "relative group flex items-center justify-between p-4 mb-3 rounded-xl border transition-all",
        task.isCompleted 
          ? "bg-[#111] border-[#222] opacity-60" 
          : "bg-[#1a1a1a] border-[#333] hover:border-gray-500"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox Circle */}
        <button
          onClick={() => onComplete(task.id)}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
            task.isCompleted 
              ? "bg-green-600 border-green-600" 
              : "border-gray-500 hover:border-blue-500"
          )}
        >
          {task.isCompleted && <FaCheck className="text-white text-xs" />}
        </button>

        {/* Text Content */}
        <div>
          <h3 className={cn("font-medium", task.isCompleted && "line-through text-gray-500")}>
            {task.title}
          </h3>
          <span className={cn("text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider", difficultyColors[task.difficulty])}>
            {task.difficulty.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Delete Button (Only visible on hover) */}
      <button 
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity p-2"
      >
        <FaTrash />
      </button>
    </motion.div>
  );
};