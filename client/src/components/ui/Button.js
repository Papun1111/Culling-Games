import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const Button = ({ 
  children, 
  onClick, 
  variant = "primary", // primary, danger, ghost
  isLoading = false, 
  className,
  type = "button"
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
    ghost: "bg-transparent hover:bg-white/10 text-gray-300",
    gacha: "bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 shadow-[0_0_15px_#7e22ce]"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={cn(baseStyles, variants[variant], className)}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};