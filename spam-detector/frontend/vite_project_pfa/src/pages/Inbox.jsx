import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import EmailCard from "../components/EmailCard";
import { useNavigate } from "react-router-dom";

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const fetchEmails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        navigate("/login");
      }
    }
  }, [navigate]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmails = emails.filter(email => {
    const q = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(q) ||
      email.from_email?.toLowerCase().includes(q) ||
      email.body?.replace(/<[^>]+>/g, "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!user_id) { navigate("/login"); return; }
    fetchEmails();
  }, [user_id, navigate, fetchEmails]);

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title="Inbox" onSearch={setSearchQuery} />
        <div className="overflow-y-auto flex-1">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M2 7l8 5.5L18 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {searchQuery ? (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No results found</p>
                  <p className="text-[13px]">No emails match "{searchQuery}".</p>
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No emails yet</p>
                  <p className="text-[13px]">New messages will appear here.</p>
                </>
              )}
            </div>
          ) : (
            filteredEmails.map(email => (
              <EmailCard key={email.id} email={email} refresh={fetchEmails} searchQuery={searchQuery} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}