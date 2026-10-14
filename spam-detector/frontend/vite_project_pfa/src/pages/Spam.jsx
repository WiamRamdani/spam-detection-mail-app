import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import formatDate from "../utils/date";
import highlightMatch from "../utils/highlight";

const AVATAR_COLORS = [
  { bg: "#FCEBEB", text: "#791F1F" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#F5C4B3", text: "#993C1D" },
];

function getInitials(email = "") {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function Spam() {
  const [emails, setEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const fetchSpam = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/spam", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!user_id) { navigate("/login"); return; }
    fetchSpam();
  }, [user_id, navigate, fetchSpam]);

  const filteredEmails = emails.filter(email => {
    const q = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(q) ||
      email.from_email?.toLowerCase().includes(q) ||
      email.body?.replace(/<[^>]+>/g, "").toLowerCase().includes(q)
    );
  });

  const handleNotSpam = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    await axios.put(`http://127.0.0.1:8000/mark-not-spam/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSpam();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    await axios.put(`http://127.0.0.1:8000/email/${id}/trash`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSpam();
  };

  const handleEmptyAll = async () => {
    const token = localStorage.getItem("token");
    await Promise.all(emails.map(e =>
      axios.put(`http://127.0.0.1:8000/email/${e.id}/trash`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ));
    setEmails([]);
  };

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Header title="Spam" onSearch={setSearchQuery} />

        <div className="overflow-y-auto flex-1">

          {filteredEmails.length > 0 && (
            <div className="flex items-center gap-2.5 mx-4 mt-3 mb-1 px-3.5 py-2.5 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                <circle cx="7" cy="7" r="5.5" stroke="#A32D2D" strokeWidth="1.2" fill="none"/>
                <path d="M7 4.5v3M7 9.5v.5" stroke="#A32D2D" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] text-red-800 dark:text-red-300 flex-1 leading-relaxed">
                Messages detected as spam by AI. Mark as "Not spam" to move them to your inbox.
              </span>
              <button onClick={handleEmptyAll}
                      className="text-[12px] text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md px-2.5 py-1 bg-transparent hover:bg-red-100 dark:hover:bg-red-900 transition-colors whitespace-nowrap cursor-pointer font-sans">
                Empty all
              </button>
            </div>
          )}

          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
              <div className="w-12 h-12 rounded-[14px] bg-red-50 dark:bg-red-950 flex items-center justify-center mb-1">
                <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="#A32D2D" strokeWidth="1.2" fill="none"/>
                  <path d="M7 4.5v3M7 9.5v.5" stroke="#A32D2D" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              {searchQuery ? (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No results found</p>
                  <p className="text-[13px]">No emails match "{searchQuery}".</p>
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No spam</p>
                  <p className="text-[13px]">Your inbox is clean.</p>
                </>
              )}
            </div>
          ) : (
            filteredEmails.map((email) => {
              const color = AVATAR_COLORS[email.id % AVATAR_COLORS.length];
              return (
                <div key={email.id}
                     onClick={() => navigate(`/email/${email.id}`)}
                     className="flex items-start gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-colors opacity-85">

                  <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
                       style={{ background: color.bg, color: color.text }}>
                    {getInitials(email.from_email || email.sender_email || "")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-[13px] text-neutral-500 truncate">{email.from_email || email.sender_email}</span>
                      <span className="text-[11px] text-neutral-400 flex-shrink-0">{formatDate(email.created_at)}</span>
                    </div>
                    <div className="text-[13px] text-neutral-700 dark:text-neutral-300 truncate mb-0.5">
                      {highlightMatch(email.subject, searchQuery)}
                    </div>
                    <div className="text-[12px] text-neutral-400 truncate">
                      {highlightMatch(email.body?.replace(/<[^>]+>/g, "").slice(0, 80), searchQuery)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400">
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                          <path d="M6 3.5v3M6 8.5v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        Spam
                      </span>
                      <button onClick={(e) => handleNotSpam(e, email.id)}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 border-none cursor-pointer hover:opacity-75 transition-opacity font-sans">
                        Not spam
                      </button>
                      <button onClick={(e) => handleDelete(e, email.id)}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-none cursor-pointer hover:opacity-75 transition-opacity font-sans ml-auto">
                        Delete
                      </button>
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