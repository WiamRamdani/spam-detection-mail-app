import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import formatDate from "../utils/date";
import  highlightMatch from "../utils/highlight";

function getInitials(email = "") {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#EEEDFE", text: "#3C3489" },
];

export default function Trash() {
  const [emails, setEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const fetchTrash = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/trash", {
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
    fetchTrash();
  }, [user_id, navigate, fetchTrash]);

  const filteredEmails = emails.filter(email => {
    const q = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(q) ||
      (email.sender_email || email.from_email)?.toLowerCase().includes(q) ||
      email.body?.replace(/<[^>]+>/g, "").toLowerCase().includes(q)
    );
  });

  const handleRestore = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    await axios.put(`http://127.0.0.1:8000/email/${id}/restore`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTrash();
  };

  const handleDeleteForever = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    await axios.delete(`http://127.0.0.1:8000/email/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTrash();
  };

  const handleEmptyTrash = async () => {
    const token = localStorage.getItem("token");
    await Promise.all(emails.map(e =>
      axios.delete(`http://127.0.0.1:8000/email/${e.id}`, {
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
        <Header title="Trash" onSearch={setSearchQuery} />

        <div className="overflow-y-auto flex-1">

          {filteredEmails.length > 0 && (
            <div className="flex items-center gap-2.5 mx-4 mt-3 mb-1 px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-neutral-400">
                <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M11.5 3.5l-.7 8a1 1 0 0 1-1 .9H4.2a1 1 0 0 1-1-.9l-.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] text-neutral-500 flex-1 leading-relaxed">
                Messages in trash are kept until you empty it.
              </span>
              <button onClick={handleEmptyTrash}
                      className="text-[12px] text-red-600 border border-red-200 dark:border-red-800 rounded-md px-2.5 py-1 bg-transparent hover:bg-red-50 dark:hover:bg-red-950 transition-colors whitespace-nowrap cursor-pointer font-sans">
                Empty trash
              </button>
            </div>
          )}

          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
              <div className="w-12 h-12 rounded-[14px] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-1">
                <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M11.5 3.5l-.7 8a1 1 0 0 1-1 .9H4.2a1 1 0 0 1-1-.9l-.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              {searchQuery ? (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No results found</p>
                  <p className="text-[13px]">No emails match "{searchQuery}".</p>
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">Trash is empty</p>
                  <p className="text-[13px]">Deleted emails will appear here.</p>
                </>
              )}
            </div>
          ) : (
            filteredEmails.map((email) => {
              const color = AVATAR_COLORS[email.id % AVATAR_COLORS.length];
              return (
                <div key={email.id}
                     onClick={() => navigate(`/email/${email.id}`)}
                     className="flex items-start gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors opacity-75">

                  <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
                       style={{ background: color.bg, color: color.text }}>
                    {getInitials(email.sender_email || email.from_email || "")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-[13px] text-neutral-500 truncate">{email.sender_email || email.from_email}</span>
                      <span className="text-[11px] text-neutral-400 flex-shrink-0">{formatDate(email.created_at)}</span>
                    </div>
                    <div className="text-[13px] text-neutral-500 truncate mb-0.5">
                      {highlightMatch(email.subject, searchQuery)}
                    </div>
                    <div className="text-[12px] text-neutral-400 truncate mb-1.5">
                      {highlightMatch(email.body?.replace(/<[^>]+>/g, "").slice(0, 80), searchQuery)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => handleRestore(e, email.id)}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 border-none cursor-pointer hover:opacity-75 transition-opacity font-sans">
                        Restore
                      </button>
                      <button onClick={(e) => handleDeleteForever(e, email.id)}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-600 border-none cursor-pointer hover:opacity-75 transition-opacity font-sans ml-auto">
                        Delete forever
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