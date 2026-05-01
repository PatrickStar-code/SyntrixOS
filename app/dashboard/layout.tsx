import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { NeuralBackground } from "@/components/NeuralBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <NeuralBackground />
      </div>
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto relative z-10 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
