import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [inboxCount, setInboxCount] = useState(null);
  const [spamCount, setSpamCount] = useState(null);
  const [profile, setProfile] = useState({ full_name: "", email: "", avatar: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [inboxRes, spamRes, meRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/inbox", { headers }),
          axios.get("http://127.0.0.1:8000/spam", { headers }),
          axios.get("http://127.0.0.1:8000/profile", { headers }),
        ]);

        setInboxCount(Array.isArray(inboxRes.data) ? inboxRes.data.length : 0);
        setSpamCount(Array.isArray(spamRes.data) ? spamRes.data.length : 0);
        setProfile(meRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  // Génère les initiales depuis full_name ou email
  const initials = profile.full_name
    ? profile.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : profile.email.slice(0, 2).toUpperCase();

  const links = [
    {
      to: "/inbox",
      label: "Inbox",
      icon: <path d="M1 4l6 4.5L13 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>,
      count: inboxCount,
    },
    {
      to: "/sent",
      label: "Sent",
      icon: <path d="M2 7l10-5-5 10-1.5-4L2 7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>,
    },
    {
      to: "/spam",
      label: "Spam",
      icon: <><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
      count: spamCount,
    },
    {
      to: "/trash",
      label: "Trash",
      icon: <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M11.5 3.5l-.7 8a1 1 0 0 1-1 .9H4.2a1 1 0 0 1-1-.9l-.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>,
    },
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/></>,
    },
  ];

  return (
    <div
      className="w-[220px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col p-3 flex-shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" , minHeight: "100vh", alignSelf: "flex-start"}}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-5">
        <div className="w-7 h-7 bg-neutral-900 dark:bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="3" width="14" height="11" rx="2" stroke="white" strokeWidth="1.3" fill="none" className="dark:stroke-neutral-900"/>
            <path d="M2 5.5L9 10l7-4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" className="dark:stroke-neutral-900"/>
          </svg>
        </div>
        <span
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100 tracking-tight"
        >
          Mailbox
        </span>
      </div>

      {/* Avatar → profil */}
      <div
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors mb-3"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
          {profile.avatar
            ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
            : initials}
        </div>
        <span className="text-[13px] text-neutral-600 dark:text-neutral-400 truncate">
          {profile.full_name || profile.email}
        </span>
      </div>

      {/* Compose */}
      <button
        onClick={() => navigate("/send-email")}
        className="flex items-center gap-2 w-full px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-[#f5f0e8] dark:text-neutral-900 text-[13px] font-medium rounded-[9px] mb-4 hover:opacity-85 transition-opacity"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Compose
      </button>

      <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 px-2.5 mb-1">
        Mailboxes
      </p>

      {links.map(({ to, label, icon, count }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-px no-underline transition-colors
              ${active
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{icon}</svg>
            {label}
            {count != null && count > 0 && (
              <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-full
                ${active
                  ? "bg-neutral-900 dark:bg-neutral-100 text-[#f5f0e8] dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}>
                {count}
              </span>
            )}
          </Link>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors border-none bg-transparent font-sans cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.5 7H12M9.5 4.5L12 7l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 2H2.5A1 1 0 0 0 1.5 3v8a1 1 0 0 0 1 1H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        Sign out
      </button>
    </div>
  );
}