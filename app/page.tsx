"use client";

import React from "react";
import { motion } from "framer-motion";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { NeuralBackground } from "@/components/NeuralBackground";
import Link from "next/link";

const SyntrixOSLanding: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <NeuralBackground />
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      <NeuralBackground />

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-[#FFFFFF]/30">
                  <motion.span
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                      textShadow: [
                        "0 0 10px rgba(255,255,255,0.5)",
                        "0 0 20px rgba(255,255,255,0.8)",
                        "0 0 10px rgba(255,255,255,0.5)",
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-white text-3xl font-black  tracking-tighter"
                  >
                    S
                  </motion.span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-[#FFFFFF]/10 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-[#FFFFFF]/5 blur-2xl" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold mb-4 text-white tracking-tight"
          >
            Syntrix
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              OS
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-lg"
          >
            Conecte tudo. Organize sua vida.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#111111]/90 backdrop-blur-2xl rounded-2xl p-4 border border-[#FFFFFF]/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        >
          <div className="flex gap-2 mb-2 w-full">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="flex-1 py-3 px-8 rounded-lg font-bold transition-all duration-300 bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-[1.02] active:scale-95">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="flex-1 py-3 px-8 rounded-lg font-bold transition-all duration-300 bg-transparent border-2 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95">
                    Criar conta
                  </button>
                </SignUpButton>
              </>
            ) : (
              <Link href="/dashboard" className="w-full">
                <button className="w-full py-3 px-8 rounded-lg font-bold transition-all duration-300 bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  Acessar Painel do Sistema
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
            <span>Sistema seguro e criptografado</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function SyntrixOSHomePage() {
  return <SyntrixOSLanding />;
}
