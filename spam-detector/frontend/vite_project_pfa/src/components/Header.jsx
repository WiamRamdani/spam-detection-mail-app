import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header({ title = "Inbox", onSearch }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ full_name: "", email: "", avatar: null });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("http://127.0.0.1:8000/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : profile.email.slice(0, 2).toUpperCase();

  return (
    <div className="h-[52px] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-3 flex-shrink-0"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <span className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100 min-w-[56px]">
        {title}
      </span>

      <div className="relative flex-1 max-w-md">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
             width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.2"/>
          <path d="M9.5 9.5L12 12" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          value={query}
          onChange={handleChange}
          className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
          placeholder="Search emails…"
        />
      </div>

      <div
        onClick={() => navigate("/profile")}
        className="w-[30px] h-[30px] rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-[12px] font-medium text-neutral-500 ml-auto cursor-pointer flex-shrink-0 overflow-hidden"
      >
        {profile.avatar
          ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
          : initials}
      </div>
    </div>
  );
}