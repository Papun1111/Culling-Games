import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard Utility for merging Tailwind classes safely.
 * Usage: cn("bg-red-500", condition && "text-white", "p-4")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a readable format.
 * Example: "2026-02-05" -> "Feb 5, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns the styling classes based on Character Rarity.
 * Used for Cards, Text, and Borders in the Gacha system.
 */
export function getRarityColor(rarity) {
  switch (rarity) {
    case "UR": // Ultra Rare (Special Grade)
      return "text-[#a855f7] border-[#a855f7] shadow-[0_0_15px_#a855f7]"; // Purple
    case "SSR": // Super Super Rare (Grade 1)
      return "text-[#ef4444] border-[#ef4444] shadow-[0_0_10px_#ef4444]"; // Red
    case "SR": // Super Rare (Grade 2)
      return "text-[#eab308] border-[#eab308]"; // Gold
    case "R": // Rare (Grade 3/4)
    default:
      return "text-[#3b82f6] border-[#3b82f6]"; // Blue
  }
}

/**
 * Returns the background gradient for Rarity Cards
 */
export function getRarityGradient(rarity) {
    switch (rarity) {
      case "UR":
        return "bg-gradient-to-br from-[#3b0764] to-[#7e22ce]";
      case "SSR":
        return "bg-gradient-to-br from-[#450a0a] to-[#ef4444]";
      case "SR":
        return "bg-gradient-to-br from-[#422006] to-[#eab308]";
      default:
        return "bg-gradient-to-br from-[#172554] to-[#3b82f6]";
    }
  }