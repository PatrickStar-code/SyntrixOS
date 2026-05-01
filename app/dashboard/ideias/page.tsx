"use client";

import { motion } from "framer-motion";
import { Lightbulb, PlusCircle, Sparkles } from "lucide-react";

export default function IdeiasPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500">
            <Lightbulb size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Cofre de Ideias
            </h1>
            <p className="text-gray-400">
              Capture insights antes que eles sumam.
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <PlusCircle size={20} />
          <span>Nova Ideia</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold">Ideia de App #{i}</h3>
              <Sparkles
                size={16}
                className="text-gray-600 group-hover:text-yellow-500"
              />
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">
              Uma breve descrição da ideia será colocada aqui com um máximo de
              duas linhas para exibição.
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
