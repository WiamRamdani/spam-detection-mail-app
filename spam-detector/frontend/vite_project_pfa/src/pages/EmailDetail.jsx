import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

/* ─── Google Fonts (add to your index.html <head> if not already present)
   <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
─── */

const styles = {
  root: {
    display: "flex",
    alignItems: "flex-start",
    minHeight: "100vh",
    background: "var(--color-background-tertiary, #f5f5f3)",
    fontFamily: "'Geist', sans-serif",
  },  // ← supprime overflow: "hidden"

  main: {
    flex: 1,
    padding: "2rem 2.5rem",
    paddingBottom: "4rem",
    display: "flex",
    flexDirection: "column",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#9ca3af",
    cursor: "pointer",
    marginBottom: "1.5rem",
    letterSpacing: "0.02em",
    border: "none",
    background: "none",
    padding: 0,
    transition: "color 0.15s",
  },
  card: {
    maxWidth: "720px",
    background: "var(--color-background-primary, #ffffff)",
    border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.12))",
    borderRadius: "12px",
    padding: "2rem 2.25rem",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  subject: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "26px",
    lineHeight: 1.25,
    color: "var(--color-text-primary, #111)",
    marginBottom: "1.25rem",
    letterSpacing: "-0.3px",
    fontWeight: 400,
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginBottom: "1.5rem",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    border: "0.5px solid var(--color-border-secondary, rgba(0,0,0,0.2))",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-secondary, #555)",
    transition: "background 0.1s",
    fontFamily: "'Geist', sans-serif",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  metaLabel: {
    fontSize: "10px",
    fontWeight: 500,
    color: "var(--color-text-tertiary, #aaa)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    minWidth: "30px",
  },
  metaValue: {
    fontSize: "13px",
    color: "var(--color-text-secondary, #555)",
  },
  divider: {
    height: "0.5px",
    background: "var(--color-border-tertiary, rgba(0,0,0,0.1))",
    margin: "1.25rem 0",
  },
  body: {
    fontSize: "14px",
    lineHeight: 1.85,
    color: "var(--color-text-primary, #111)",
    fontWeight: 300,
    whiteSpace: "pre-line",
    flex: 1,
  },
  footer: {
    marginTop: "2rem",
    paddingTop: "1.25rem",
    borderTop: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  prob: {
    fontSize: "12px",
    color: "var(--color-text-tertiary, #aaa)",
    marginLeft: "auto",
  },
  loading: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    color: "#9ca3af",
    fontFamily: "'Geist', sans-serif",
    background: "var(--color-background-tertiary, #f5f5f3)",
  },
};

/* ── Helpers ── */
function getInitials(email = "") {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

const avatarColors = [
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#FAEEDA", color: "#854F0B" },
];

function Avatar({ email, index = 0 }) {
  const { bg, color } = avatarColors[index % avatarColors.length];
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "9px",
        fontWeight: 500,
        color,
        flexShrink: 0,
      }}
    >
      {getInitials(email)}
    </div>
  );
}

function SpamBadge({ isSpam }) {
  const spam = {
    background: "#FAECE7",
    color: "#993C1D",
    dot: "#D85A30",
    label: "Spam",
  };
  const safe = {
    background: "#E1F5EE",
    color: "#0F6E56",
    dot: "#1D9E75",
    label: "Not spam",
  };
  const s = isSpam ? spam : safe;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.03em",
        background: s.background,
        color: s.color,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </div>
  );
}

/* ── Icons ── */
const IconBack = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2L4 6l4 4" />
  </svg>
);
const IconReply = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 6h8M6 2L2 6l4 4" />
  </svg>
);
const IconForward = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 6H2M6 2l4 4-4 4" />
  </svg>
);
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 3h8M4 3V2h4v1M3 3l1 7h4l1-7" />
  </svg>
);

/* ── Main Component ── */
export default function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  // Reply / Forward
  const [mode, setMode] = useState(null); // "reply" | "forward" | null
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");
  // Delete
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [keywords, setKeywords] = useState([]);
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/email/${id}`);
        setEmail(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchKeywords = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/email/${id}/keywords`);
        setKeywords(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmail();
    fetchKeywords();
  }, [id]);
    // Correction manuelle
  const [localPrediction, setLocalPrediction] = useState(null);
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    if (email) setLocalPrediction(email.prediction);
  }, [email]);

  const handleCorrection = async () => {
    setCorrecting(true);
    try {
      const token = localStorage.getItem("token");
      const newPrediction = localPrediction === 1 ? 0 : 1;
      const route = newPrediction === 1
        ? `mark-spam/${id}`
        : `mark-not-spam/${id}`;
      await axios.put(`http://127.0.0.1:8000/${route}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalPrediction(newPrediction);
    } catch (err) {
      console.error(err);
    } finally {
      setCorrecting(false);
    }
  };
  // Ouvre le panneau reply/forward avec les bons pré-remplis
  const openReply = () => {
    setReplyTo(email.sender_email);
    setReplySubject(`Re: ${email.subject}`);
    setReplyBody(`\n\n--- Original message ---\n${email.body}`);
    setMode("reply");
    setSendError("");
    setSendSuccess(false);
  };

  const openForward = () => {
    setReplyTo("");
    setReplySubject(`Fwd: ${email.subject}`);
    setReplyBody(`\n\n--- Forwarded message ---\nFrom: ${email.sender_email}\n\n${email.body}`);
    setMode("forward");
    setSendError("");
    setSendSuccess(false);
  };

  const handleSend = async () => {
    setSending(true);
    setSendError("");
    try {
      const token = localStorage.getItem("token");
      const user_id = localStorage.getItem("user_id");
      await axios.post(
        "http://127.0.0.1:8000/send-email",
        { subject: replySubject, body: replyBody, sender_id: user_id, receiver_email: replyTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSendSuccess(true);
      setTimeout(() => { setMode(null); setSendSuccess(false); }, 1200);
    } catch (err) {
      setSendError(err.response?.data?.detail || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/email/${id}/trash`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!email) {
    return <div style={styles.loading}>Loading…</div>;
  }

  const isSpam = localPrediction === 1;

  return (
    <div style={styles.root}>
      <Sidebar />

      <div style={styles.main}>
        {/* Back button */}
        <button
          style={styles.back}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#6b7280")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          <IconBack /> Back to inbox
        </button>

        <div style={styles.card}>
          {/* Subject */}
          <h1 style={styles.subject}>{email.subject}</h1>

          {/* Action buttons */}
          <div style={styles.actions}>
            <button
              style={styles.btn}
              onClick={openReply}
              onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f3)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--color-background-primary, #fff)"}
            >
              <IconReply /> Reply
            </button>

            <button
              style={styles.btn}
              onClick={openForward}
              onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f3)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--color-background-primary, #fff)"}
            >
              <IconForward /> Forward
            </button>

            <button
              style={{
                ...styles.btn,
                ...(confirmDelete
                  ? { background: "#FCEBEB", color: "#A32D2D", borderColor: "#F09595" }
                  : {})
              }}
              onClick={handleDelete}
              disabled={deleting}
              onMouseEnter={e => !confirmDelete && (e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f3)")}
              onMouseLeave={e => !confirmDelete && (e.currentTarget.style.background = "var(--color-background-primary, #fff)")}
            >
              <IconTrash />
              {deleting ? "Deleting…" : confirmDelete ? "Confirm delete?" : "Delete"}
            </button>

            {/* Annuler confirm delete */}
            {confirmDelete && !deleting && (
              <button
                style={{ ...styles.btn, color: "#9ca3af" }}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Metadata */}
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>From</span>
            <Avatar email={email.sender_email} index={0} />
            <span style={styles.metaValue}>{email.sender_email}</span>
          </div>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>To</span>
            <Avatar email={email.receiver_email} index={1} />
            <span style={styles.metaValue}>{email.receiver_email}</span>
          </div>

          <div style={styles.divider} />

          

          <div style={styles.body} dangerouslySetInnerHTML={{ __html: email.body }} />

          

          <div style={styles.footer}>
            <SpamBadge isSpam={isSpam} />
            {/* Bouton de correction */}
            <button
              onClick={handleCorrection}
              disabled={correcting}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20, fontSize: 11,
                fontWeight: 500, cursor: "pointer", border: "none",
                fontFamily: "'Geist', sans-serif",
                background: localPrediction === 1 ? "#E1F5EE" : "#FAECE7",
                color: localPrediction === 1 ? "#0F6E56" : "#993C1D",
                opacity: correcting ? 0.6 : 1,
                transition: "background 0.2s",
              }}
            >
              {correcting
                ? "Saving…"
                : localPrediction === 1
                ? "✓ Mark as not spam"
                : "⚑ Mark as spam"}
            </button>
            <span style={styles.prob}>
              Probability:{" "}
              <span style={{ color: "var(--color-text-secondary, #555)", fontWeight: 500 }}>
                {Number(email.probability).toFixed(3)}
              </span>
            </span>
          </div>
        </div>

        {/* Reply / Forward panel */}
        {mode && (
        <div style={{
          maxWidth: "720px",
          marginTop: "12px",
          marginBottom: "2rem",
          background: "var(--color-background-primary, #fff)",
          border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.12))",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
            {/* Panel header */}
            <div style={{ padding: "12px 20px", borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary, #111)" }}>
                {mode === "reply" ? "Reply" : "Forward"}
              </span>
              <button
                onClick={() => setMode(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </div>

            {/* To field */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))", padding: "0 20px" }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 52 }}>To</span>
              <input
                value={replyTo}
                onChange={e => setReplyTo(e.target.value)}
                placeholder="recipient@example.com"
                readOnly={mode === "reply"}
                style={{ flex: 1, padding: "12px 0", fontSize: 13, border: "none", outline: "none", background: "transparent", color: "var(--color-text-primary, #111)", fontFamily: "'Geist', sans-serif" }}
              />
            </div>

            {/* Subject field */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))", padding: "0 20px" }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 52 }}>Subject</span>
              <input
                value={replySubject}
                onChange={e => setReplySubject(e.target.value)}
                style={{ flex: 1, padding: "12px 0", fontSize: 13, border: "none", outline: "none", background: "transparent", color: "var(--color-text-primary, #111)", fontFamily: "'Geist', sans-serif" }}
              />
            </div>

            {/* Body */}
            <textarea
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={7}
              style={{ width: "100%", padding: "14px 20px", fontSize: 13, fontWeight: 300, lineHeight: 1.75, border: "none", outline: "none", resize: "none", background: "transparent", fontFamily: "'Geist', sans-serif", color: "var(--color-text-primary, #111)", boxSizing: "border-box" , flex: 1, overflowY: "auto" }}
            />

            {/* Error */}
            {sendError && (
              <div style={{ margin: "0 20px 12px", padding: "8px 12px", background: "#FCEBEB", borderRadius: 8, fontSize: 12, color: "#A32D2D" }}>
                {sendError}
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: "10px 20px", borderTop: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))", display: "flex", gap: 10 }}>
              <button
                onClick={handleSend}
                disabled={sending || sendSuccess}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", border: "none", fontFamily: "'Geist', sans-serif",
                  background: sendSuccess ? "#E1F5EE" : "#111",
                  color: sendSuccess ? "#0F6E56" : "#fff",
                  opacity: sending ? 0.6 : 1,
                  transition: "background 0.2s",
                }}
              >
                {sendSuccess ? "✓ Sent!" : sending ? "Sending…" : mode === "reply" ? "Send reply" : "Forward"}
              </button>
              <button
                onClick={() => setMode(null)}
                style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontFamily: "'Geist', sans-serif" }}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}