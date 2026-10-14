import axios from "axios";
import { useNavigate } from "react-router-dom";
import formatDate from "../utils/date";
import highlightMatch from "../utils/highlight";

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}



const AVATAR_COLORS = [
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
];

export default function EmailCard({ email, refresh, searchQuery = ""  }) {
  const navigate = useNavigate();
  const color = AVATAR_COLORS[email.id % AVATAR_COLORS.length];

  const handleNotSpam = async (e) => {
    e.stopPropagation();
    await axios.put(`http://127.0.0.1:8000/mark-not-spam/${email.id}`);
    refresh();
  };

  return (
    <div onClick={() => navigate(`/email/${email.id}`)}
         className={`flex items-start gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60
           ${!email.read ? "bg-white dark:bg-neutral-900" : "bg-neutral-50/50 dark:bg-neutral-900/30"}`}
         style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Unread dot */}
      <div className="mt-1.5 flex-shrink-0 w-[7px] flex justify-center">
        {!email.read && <div className="w-[7px] h-[7px] rounded-full bg-blue-600" />}
      </div>

      {/* Avatar */}
      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
           style={{ background: color.bg, color: color.text }}>
        {getInitials(email.from_email || email.sender)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className={`text-[13px] truncate ${!email.read ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500"}`}>
            {email.from_email || email.sender}
          </span>
          <span className="text-[11px] text-neutral-400 flex-shrink-0">{formatDate(email.created_at)}</span>
        </div>
        <div className={`text-[13px] truncate mb-0.5 ${!email.read ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500"}`}>
          {highlightMatch(email.subject, searchQuery)}
        </div>
        <div className="text-[12px] text-neutral-400 truncate">
          {highlightMatch(email.body?.replace(/<[^>]+>/g, "").slice(0, 80), searchQuery)}
        </div>

        {email.prediction === 1 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-500">
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M6 3.5v3M6 8.5v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Spam
            </span>
            <button onClick={handleNotSpam}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 border-none cursor-pointer hover:opacity-80 transition-opacity font-sans">
              Not spam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}