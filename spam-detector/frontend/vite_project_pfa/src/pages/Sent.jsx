import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import formatDate from "../utils/date";
import highlightMatch from "../utils/highlight";

const AVATAR_COLORS = [
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
];

function getInitials(email = "") {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function Sent() {
  const [emails, setEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!user_id) { navigate("/login"); return; }

    const fetchSent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/sent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmails(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };

    fetchSent();
  }, [user_id, navigate]);

  const filteredEmails = emails.filter(email => {
    const q = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(q) ||
      email.receiver_email?.toLowerCase().includes(q) ||
      email.to_email?.toLowerCase().includes(q) ||
      email.body?.replace(/<[^>]+>/g, "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Header title="Sent" onSearch={setSearchQuery} />

        <div className="overflow-y-auto flex-1">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
                <path d="M3 10l14-7-7 14-2-5-5-2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
              </svg>
              {searchQuery ? (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No results found</p>
                  <p className="text-[13px]">No emails match "{searchQuery}".</p>
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No sent emails</p>
                  <p className="text-[13px]">Emails you send will appear here.</p>
                </>
              )}
            </div>
          ) : (
            filteredEmails.map((email) => {
              const to = email.receiver_email || email.to_email || "";
              const color = AVATAR_COLORS[email.id % AVATAR_COLORS.length];
              return (
                <div key={email.id}
                     onClick={() => navigate(`/email/${email.id}`)}
                     className="flex items-start gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">

                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l10-5-5 10-1.5-4L2 7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                    </svg>
                    Sent
                  </div>

                  <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
                       style={{ background: color.bg, color: color.text }}>
                    {getInitials(to)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        To: {to}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex-shrink-0">{formatDate(email.created_at)}</span>
                    </div>
                    <div className="text-[13px] text-neutral-700 dark:text-neutral-300 truncate mb-0.5">
                      {highlightMatch(email.subject, searchQuery)}
                    </div>
                    <div className="text-[12px] text-neutral-400 truncate">
                      {highlightMatch(email.body?.replace(/<[^>]+>/g, "").slice(0, 80), searchQuery)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}