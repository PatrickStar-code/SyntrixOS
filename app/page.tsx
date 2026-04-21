"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Dot {
  x: number;
  y: number;
  baseOpacity: number;
  currentOpacity: number;
  opacitySpeed: number;
  baseRadius: number;
  currentRadius: number;
}

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  speed: number;
}

const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeDots();
      initializeConnections();
    };

    const initializeDots = () => {
      const dots: Dot[] = [];
      const numDots = 80;

      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseOpacity: Math.random() * 0.3 + 0.1,
          currentOpacity: Math.random() * 0.3 + 0.1,
          opacitySpeed: Math.random() * 0.002 + 0.001,
          baseRadius: Math.random() * 1.5 + 0.5,
          currentRadius: Math.random() * 1.5 + 0.5,
        });
      }
      dotsRef.current = dots;
    };

    const initializeConnections = () => {
      const connections: Connection[] = [];
      const numConnections = 12;

      for (let i = 0; i < numConnections; i++) {
        connections.push({
          from: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },
          to: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },
          progress: Math.random(),
          speed: Math.random() * 0.003 + 0.001,
        });
      }
      connectionsRef.current = connections;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot) => {
        dot.currentOpacity += dot.opacitySpeed;
        if (dot.currentOpacity >= 0.4 || dot.currentOpacity <= 0.1) {
          dot.opacitySpeed = -dot.opacitySpeed;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 111, 60, ${dot.currentOpacity})`;
        ctx.fill();
      });

      connectionsRef.current.forEach((conn) => {
        conn.progress += conn.speed;
        if (conn.progress >= 1) {
          conn.progress = 0;
          conn.from = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          };
          conn.to = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          };
        }

        const currentX =
          conn.from.x + (conn.to.x - conn.from.x) * conn.progress;
        const currentY =
          conn.from.y + (conn.to.y - conn.from.y) * conn.progress;

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(255, 111, 60, ${0.2 * (1 - conn.progress)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 111, 60, ${0.8})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 111, 60, ${0.3})`;
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

const SyntrixOSLanding: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      <NeuralBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />

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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6F3C] to-[#FF8C42] flex items-center justify-center shadow-lg shadow-[#FF6F3C]/50">
                <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6F3C] to-[#FF8C42] animate-pulse" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-[#FF6F3C]/20 animate-ping" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold mb-4 text-white tracking-tight"
          >
            Syntrix<span className="text-[#FF6F3C]">OS</span>
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
          className="bg-[#111111]/80 backdrop-blur-xl rounded-2xl p-4 border border-[#FF6F3C]/20 shadow-2xl shadow-[#FF6F3C]/10"
        >
          <div className="flex gap-2 mb-2">
            <button className="flex-1 py-2 px-8 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-[#FF6F3C] to-[#FF8C42] text-white shadow-lg shadow-[#FF6F3C]/30">
              Entrar
            </button>
            <button className="flex-1 py-2 px-8 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-[#FF6F3C] to-[#FF8C42] text-white shadow-lg shadow-[#FF6F3C]/30">
              Criar conta
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-[#FF6F3C] animate-pulse" />
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
