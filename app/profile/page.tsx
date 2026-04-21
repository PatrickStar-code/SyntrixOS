"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/NeuralBackground";
import { Mail, Calendar, ShieldCheck, LogOut, Settings } from "lucide-react";

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <NeuralBackground />
        <div className="relative z-10">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center p-6">
      <NeuralBackground />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-[#111111]/90 backdrop-blur-2xl rounded-3xl p-8 border border-[#FFFFFF]/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          {/* Header/Avatar */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-2 border-white/30 p-1 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-full shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {user.fullName || "Membro Syntrix"}
            </h1>
            <p className="text-gray-400 mt-2">
              @{user.username || user.firstName?.toLowerCase() || "user"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    E-mail
                  </p>
                  <p className="font-medium text-white">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    Membro desde
                  </p>
                  <p className="font-medium text-white">
                    {new Date(user.createdAt!).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 flex flex-col justify-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 text-center">
                Status do Sistema
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
                <span className="text-white font-bold">Online</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 py-4 px-6 rounded-xl font-bold bg-white text-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:-translate-y-1">
              <Settings size={20} />
              Configurações
            </button>
            <SignOutButton>
              <button className="flex-1 py-4 px-6 rounded-xl font-bold border-2 border-white/20 text-white flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <LogOut size={20} />
                Sair do Sistema
              </button>
            </SignOutButton>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs tracking-widest uppercase opacity-50">
          SyntrixOS v1.0.4 • Core Authentication Active
        </div>
      </motion.div>
    </div>
  );
}
