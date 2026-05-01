"use client";

import { motion, Variants } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
} from "lucide-react";

export default function FinanceiroPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300 },
    },
  };

  const transactions = [
    {
      id: 1,
      name: "Pix Recebido - Client",
      amount: "+ R$ 1.250,00",
      type: "in",
      date: "Hoje, 14:30",
    },
    {
      id: 2,
      name: "Assinatura Netflix",
      amount: "- R$ 39,90",
      type: "out",
      date: "Ontem, 09:15",
    },
    {
      id: 3,
      name: "Pagamento Fatura Cartão",
      amount: "- R$ 450,00",
      type: "out",
      date: "15 Mai, 10:00",
    },
    {
      id: 4,
      name: "Venda E-book",
      amount: "+ R$ 97,00",
      type: "in",
      date: "14 Mai, 18:45",
    },
  ];

  const graphicData = [
    { month: "Jan", height: "40%" },
    { month: "Fev", height: "60%" },
    { month: "Mar", height: "35%" },
    { month: "Abr", height: "80%" },
    { month: "Mai", height: "95%", active: true },
    { month: "Jun", height: "50%" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-end pb-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              Painel Financeiro
            </h1>
            <p className="text-gray-400">
              Paz mental através de controle absoluto.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cards de Resumo */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-3xl bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/5 text-gray-300 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-bold tracking-widest uppercase mb-1">
            Saldo Atual
          </p>
          <h3 className="text-4xl font-black text-white">
            R$ 4.250<span className="text-xl text-gray-500">,00</span>
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
              +12% este mês
            </span>
          </div>
          <p className="text-sm text-gray-400 font-bold tracking-widest uppercase mb-1">
            Entradas
          </p>
          <h3 className="text-4xl font-black text-white">
            R$ 5.100<span className="text-xl text-gray-500">,00</span>
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-red-500/30 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-bold tracking-widest uppercase mb-1">
            Saídas
          </p>
          <h3 className="text-4xl font-black text-white">
            R$ 850<span className="text-xl text-gray-500">,00</span>
          </h3>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Estático com CSS Tailwind */}
        <motion.div
          variants={itemVariants}
          className="bg-[#111111]/40 rounded-3xl p-6 border border-white/5 space-y-6"
        >
          <h2 className="text-xl font-bold">Balanço Semestral</h2>

          <div className="h-48 flex items-end justify-between gap-2 pt-10">
            {graphicData.map((data) => (
              <div
                key={data.month}
                className="flex flex-col items-center gap-3 flex-1 h-full justify-end group"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: data.height }}
                  transition={{ duration: 1, type: "spring" }}
                  className={`w-full max-w-[40px] rounded-t-lg transition-colors relative
                    ${data.active ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/10 group-hover:bg-white/20"}
                  `}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded font-bold pointer-events-none">
                    {data.height}
                  </div>
                </motion.div>
                <div
                  className={`text-xs font-bold ${data.active ? "text-emerald-400" : "text-gray-500"}`}
                >
                  {data.month}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lista de Transações */}
        <motion.div
          variants={itemVariants}
          className="bg-[#111111]/60 rounded-3xl p-6 border border-white/5"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <CreditCard size={20} className="text-gray-400" />
              Recentes
            </h2>
            <button className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
              Ver todas
            </button>
          </div>

          <div className="space-y-4">
            {transactions.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${t.type === "in" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                  >
                    {t.type === "in" ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownRight size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{t.date}</p>
                  </div>
                </div>
                <div
                  className={`font-black tracking-tight ${t.type === "in" ? "text-emerald-400" : "text-white"}`}
                >
                  {t.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
