import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState(0);

  const checkStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setStrength(score);
    setPassword(val);
  };

  const strengthMeta = [
    { width: "0%",   color: "transparent",  label: "Use 8+ characters for a strong password." },
    { width: "25%",  color: "#E24B4A",       label: "Weak — try adding numbers or symbols." },
    { width: "50%",  color: "#EF9F27",       label: "Fair — add uppercase letters." },
    { width: "75%",  color: "#639922",       label: "Good — almost there." },
    { width: "100%", color: "#1D9E75",       label: "Strong password." },
  ];

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/register", { email, password, full_name: fullName });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 px-4"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 w-full max-w-sm shadow-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
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

        {/* Headline */}
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight mb-1">
          Create an account
        </h1>
        <p className="text-sm text-neutral-500 mb-7">
          Start sending and receiving mail today.
        </p>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 rounded-lg px-3 py-2 mb-4"
          >
            {error}
          </motion.p>
        )}

        {/* Full name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
            Full name
          </label>
          <input
            type="text"
            placeholder="Your name"
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
          />
        </div>


        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
          />
        </div>

        {/* Password + strength */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            onChange={(e) => checkStrength(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
          />
          {/* Strength bar */}
          <div className="h-[3px] rounded-full bg-neutral-200 dark:bg-neutral-700 mt-2 overflow-hidden">
            <motion.div
              animate={{ width: strengthMeta[strength].width }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: strengthMeta[strength].color }}
              className="h-full rounded-full"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            {strengthMeta[strength].label}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-lg transition-opacity disabled:opacity-40 hover:opacity-85 active:scale-[0.99]"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-neutral-900 dark:text-neutral-100 font-weight-500 underline underline-offset-2 cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </motion.div>
    </div>
  );
}