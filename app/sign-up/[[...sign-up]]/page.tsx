import { SignUp } from "@clerk/nextjs";
import { NeuralBackground } from "@/components/NeuralBackground";

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      <NeuralBackground />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />

      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#111111]/90 backdrop-blur-2xl border border-[#FFFFFF]/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all duration-300",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-300 font-medium",
              formFieldInput:
                "bg-black/50 border-white/10 text-white focus:border-white/30 transition-all duration-300",
              formButtonPrimary:
                "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 font-bold",
              footerActionLink: "text-white hover:text-gray-300 font-semibold",
              identityPreviewText: "text-white",
              formFieldAction: "text-white hover:text-gray-300",
              formResendCodeLink: "text-white hover:text-gray-300",
              otpCodeFieldInput:
                "bg-black/50 border-white/10 text-white focus:border-white/30",
            },
          }}
        />
      </div>
    </div>
  );
}
