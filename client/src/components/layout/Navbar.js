"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { useSession } from "next-auth/react"; // 1. Import useSession
import { FaBolt, FaCoins, FaDragon, FaTasks, FaUser } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession(); // 2. Get Session Status
  const { user, fetchUserData } = useGameStore();

  // 3. 🟢 CRITICAL FIX: Only fetch if we are actually logged in.
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]); // Run this check whenever status changes

  const navItems = [
    { name: "Tasks", href: "/tasks", icon: <FaTasks /> },
    { name: "Gacha", href: "/gacha", icon: <FaDragon /> },
    { name: "Colony", href: "/colony", icon: <FaBolt /> },
    { name: "Profile", href: "/profile", icon: <FaUser /> },
  ];

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto w-full bg-[#0f0f0f] border-t md:border-b border-[#333] z-50 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="hidden md:block font-bold text-xl tracking-tighter text-white">
        CULLING GAME <span className="text-purple-500">PROTOCOL</span>
      </div>

      {/* Navigation Links - Only show if logged in */}
      {status === "authenticated" ? (
        <div className="flex w-full md:w-auto justify-around md:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm font-medium transition-colors p-2 rounded-lg",
                  isActive ? "text-blue-400 bg-blue-400/10" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        // Spacer for unauthenticated state to keep layout stable
        <div className="flex-1" />
      )}

      {/* User Stats (Right Side) */}
      <div className="hidden md:flex items-center gap-4">
        {status === "authenticated" && user && (
            <>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/20 text-yellow-500 rounded-full border border-yellow-900/50">
                    <FaCoins /> 
                    <span className="font-mono font-bold">{user.points}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/20 text-purple-500 rounded-full border border-purple-900/50">
                    <FaBolt /> 
                    <span className="font-mono font-bold">{user.cursedEnergy}/{user.maxEnergy}</span>
                </div>
            </>
        )}
      </div>
    </nav>
  );
};