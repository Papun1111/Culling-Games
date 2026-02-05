"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FaGoogle, FaDragon, FaBolt, FaTasks } from "react-icons/fa";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use Ref ONLY to prevent double-firing the router.push inside useEffect
  const hasRedirected = useRef(false);

  useEffect(() => {
    // 1. Only run this side effect if we are authenticated
    // 2. AND we haven't already issued the redirect command
    if (status === "authenticated" && !hasRedirected.current) {
      hasRedirected.current = true; 
      router.push("/tasks");
    }
  }, [status, router]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // 🟢 FIX: Simplified Condition
  // We removed 'hasRedirected.current' from here to fix the error.
  // Logic: If we are loading OR we are already authenticated, 
  // we act as if we are "busy" to prevent the Landing Page from flashing.
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-12">
      
      {/* 1. HERO SECTION */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-2xl mx-auto"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-sm font-bold tracking-[0.3em] text-red-500 uppercase">
            Productivity Expansion
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            CULLING GAME <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">
              PROTOCOL
            </span>
          </h1>
        </motion.div>

        <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
          Your real-life tasks are Curses. Your productivity is Cursed Energy. 
          Complete missions, summon Shikigami, and survive the deadline.
        </motion.p>

        <motion.div variants={itemVariants} className="pt-4">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/tasks" })}
            className="px-8 py-6 text-xl bg-white text-black hover:bg-gray-200 hover:scale-105 transition-transform font-bold flex items-center gap-3 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <FaGoogle /> ENTER THE GAME
          </Button>
          <p className="text-xs text-gray-600 mt-4">
            *By entering, you agree to the 19-Day Rule.
          </p>
        </motion.div>
      </motion.div>

      {/* 2. FEATURES GRID */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12 text-left"
      >
        <FeatureCard 
          icon={<FaTasks className="text-blue-500" />}
          title="Exorcise Tasks"
          desc="Turn your to-do list into missions. Grade 4 chores to Special Grade projects."
        />
        <FeatureCard 
          icon={<FaDragon className="text-purple-500" />}
          title="Gacha Summons"
          desc="Spend earned points to summon characters like Gojo and Sukuna to your team."
        />
        <FeatureCard 
          icon={<FaBolt className="text-yellow-500" />}
          title="Colony Battles"
          desc="Deploy your team to patrol colonies and earn massive XP rewards."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-xl border border-[#222] bg-[#111] hover:bg-[#161616] transition-colors group">
      <div className="mb-4 text-3xl p-3 bg-black/50 w-fit rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}