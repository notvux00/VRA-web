import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <main className="z-10 flex flex-col items-center justify-center p-8 text-center max-w-4xl w-full">
        <div className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-zinc-300">
          ✨ Next.js + Tailwind CSS Workspace
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
          VRA Web Project
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-light leading-relaxed max-w-2xl">
          Your modern web application foundation is ready. Start building something amazing today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/login" className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Explore Dashboard
          </Link>
          <Link href="/register" className="px-8 py-4 bg-transparent border border-zinc-700 text-white rounded-full font-medium hover:bg-zinc-800 transition-all duration-300 text-center">
            Register Account
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-zinc-500 text-sm z-10 w-full text-center">
        Powered by React 19 & Next.js 15
      </footer>
    </div>
  );
}
