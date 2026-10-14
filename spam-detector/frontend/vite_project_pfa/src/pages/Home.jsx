import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user_id")) navigate("/inbox");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-950 px-4 relative overflow-hidden"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />

      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
           xmlns="http://www.w3.org/2000/svg">
        {[140, 280, 420].map(y => (
          <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="currentColor" strokeWidth="1"/>
        ))}
        {["20%", "50%", "80%"].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="100%" stroke="currentColor" strokeWidth="1"/>
        ))}
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="11" rx="2"
                stroke="white" strokeWidth="1.2" fill="none"
                className="dark:stroke-neutral-900" />
              <path d="M2 5.5L9 10l7-4.5"
                stroke="white" strokeWidth="1.2" strokeLinecap="round"
                className="dark:stroke-neutral-900" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-lg font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
            Mailbox
          </span>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 rounded-full px-3 py-1 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-neutral-500">AI-powered spam detection</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-5xl font-medium text-neutral-900 dark:text-neutral-100 text-center leading-tight tracking-tight mb-4 max-w-md">
          Email, <em className="text-neutral-400 not-italic">reimagined</em><br />
          with intelligence.
        </h1>

        <p className="text-[15px] text-neutral-500 text-center max-w-xs leading-relaxed mb-10">
          A smart mail platform that keeps your inbox clean and your conversations flowing.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate("/login")}
            className="px-7 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-xl hover:opacity-85 active:scale-[0.98] transition-all"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-7 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 text-sm border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            Create account
          </button>
        </div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex gap-2 mt-12"
        >
          {[
            { icon: "✓", bg: "#E1F5EE", iconColor: "#0F6E56", title: "Spam detection", desc: "AI filters junk before it reaches you." },
            { icon: "✉", bg: "#E6F1FB", iconColor: "#185FA5", title: "Smart inbox",    desc: "Conversations organized automatically." },
            { icon: "⏱", bg: "#FAEEDA", iconColor: "#854F0B", title: "Instant delivery", desc: "Real-time send and receive." },
          ].map(({ icon, bg, iconColor, title, desc }) => (
            <div key={title}
                 className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 flex-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5 text-xs"
                   style={{ background: bg, color: iconColor }}>
                {icon}
              </div>
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-1">{title}</p>
              <p className="text-[12px] text-neutral-500 leading-snug">{desc}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}