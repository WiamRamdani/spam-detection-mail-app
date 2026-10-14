import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";

export default function Compose() {
  const navigate = useNavigate();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const editorRef = useRef(null);

  const handleSend = async () => {
    setError("");
    const user_id = localStorage.getItem("user_id");
    if (!user_id) { navigate("/login"); return; }

    const html = editorRef.current?.innerHTML || "";
    const plainText = editorRef.current?.innerText || "";

    if (!plainText.trim()) {
      setError("Message body cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/send-email",
        { subject, body: html, sender_id: user_id, receiver_email: to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        setTo(""); setSubject(""); setBodyHtml("");
        if (editorRef.current) editorRef.current.innerHTML = "";
        setSuccess(false);
        navigate("/sent");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Send failed");
    } finally {
      setLoading(false);
    }
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  const canSend = to.trim() && subject.trim() && !loading;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--color-background-tertiary, #f5f5f3)", fontFamily: "'Geist', sans-serif", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem", display: "flex", flexDirection: "column" }}>

        <button
          onClick={() => navigate(-1)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "1.5rem", letterSpacing: "0.02em" }}
          onMouseEnter={e => e.currentTarget.style.color = "#6b7280"}
          onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L4 6l4 4"/></svg>
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            maxWidth: 640,
            background: "var(--color-background-primary, #fff)",
            border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.12))",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.5rem 2rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))" }}>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, color: "var(--color-text-primary, #111)", margin: 0, letterSpacing: "-0.3px" }}>
              New message
            </h1>
          </div>

          <div>
            <Field label="To" type="email">
              <input
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="recipient@example.com"
                type="email"
                style={inputStyle}
              />
            </Field>

            <Field label="Subject">
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject"
                style={inputStyle}
              />
            </Field>

            {/* Toolbar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "8px 2rem",
              borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
              flexWrap: "wrap",
            }}>
              <ToolbarBtn onClick={() => exec("bold")} title="Bold">
                <strong>B</strong>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec("italic")} title="Italic">
                <em>I</em>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec("underline")} title="Underline">
                <span style={{ textDecoration: "underline" }}>U</span>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec("strikeThrough")} title="Strikethrough">
                <span style={{ textDecoration: "line-through" }}>S</span>
              </ToolbarBtn>

              <Separator />

              <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet list">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="2" cy="3.5" r="1" fill="currentColor"/>
                  <circle cx="2" cy="7" r="1" fill="currentColor"/>
                  <circle cx="2" cy="10.5" r="1" fill="currentColor"/>
                  <path d="M5 3.5h8M5 7h8M5 10.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered list">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <text x="0" y="4.5" fontSize="4" fill="currentColor">1</text>
                  <text x="0" y="8" fontSize="4" fill="currentColor">2</text>
                  <text x="0" y="11.5" fontSize="4" fill="currentColor">3</text>
                  <path d="M5 3.5h8M5 7h8M5 10.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </ToolbarBtn>

              <Separator />

              <ToolbarBtn onClick={handleLink} title="Insert link">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M6 8l2-2M5 9.5L3 11.5a2 2 0 01-2.8-2.8L2.5 6.5M8 4.5L10 2.5a2 2 0 012.8 2.8L10.5 7.5"/>
                </svg>
              </ToolbarBtn>

              <Separator />

              <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear formatting">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M2 2l10 10M3 2h8L7 8l-2 4H3l2-4z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ToolbarBtn>
            </div>

            {/* Rich text editor */}
            <div style={{ padding: "1rem 2rem 1.5rem" }}>
              <div
                ref={editorRef}
                contentEditable
                onInput={e => setBodyHtml(e.currentTarget.innerHTML)}
                data-placeholder="Write your message…"
                style={{
                  ...inputStyle,
                  width: "100%",
                  minHeight: 200,
                  lineHeight: 1.75,
                  fontFamily: "'Geist', sans-serif",
                  outline: "none",
                  overflowY: "auto",
                }}
                className="rich-editor"
                suppressContentEditableWarning
              />
              <style>{`
                .rich-editor:empty:before {
                  content: attr(data-placeholder);
                  color: var(--color-text-tertiary, #aaa);
                  pointer-events: none;
                }
                .rich-editor ul, .rich-editor ol {
                  padding-left: 1.5em;
                  margin: 0.5em 0;
                }
                .rich-editor a {
                  color: #185FA5;
                  text-decoration: underline;
                }
              `}</style>
            </div>
          </div>

          {error && (
            <div style={{ margin: "0 2rem 1rem", padding: "10px 14px", background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, fontSize: 13, color: "#A32D2D" }}>
              {error}
            </div>
          )}

          <div style={{ padding: "1rem 2rem 1.5rem", borderTop: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))", display: "flex", alignItems: "center", gap: 12 }}>
            <motion.button
              onClick={handleSend}
              disabled={!canSend}
              whileTap={canSend ? { scale: 0.97 } : {}}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'Geist', sans-serif",
                cursor: canSend ? "pointer" : "not-allowed",
                border: "0.5px solid",
                transition: "background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s",
                ...(success
                  ? { background: "#E1F5EE", color: "#0F6E56", borderColor: "#5DCAA5" }
                  : canSend
                  ? { background: "var(--color-text-primary, #111)", color: "var(--color-background-primary, #fff)", borderColor: "transparent" }
                  : { background: "var(--color-background-secondary, #f5f5f3)", color: "var(--color-text-tertiary, #aaa)", borderColor: "var(--color-border-tertiary, rgba(0,0,0,0.1))", opacity: 0.7 }),
              }}
            >
              {success ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 6l3 3 5-5"/></svg>
                  Sent!
                </>
              ) : loading ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2L2 5.5l3.5 1 1 3.5L10 2z"/></svg>
                  Send
                </>
              )}
            </motion.button>

            <button
              onClick={() => {
                setTo(""); setSubject(""); setBodyHtml(""); setError("");
                if (editorRef.current) editorRef.current.innerHTML = "";
              }}
              style={{ fontSize: 12, color: "var(--color-text-tertiary, #aaa)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-text-secondary, #555)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-tertiary, #aaa)"}
            >
              Discard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Toolbar button ── */
function ToolbarBtn({ onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()} // empêche la perte de sélection
      onClick={onClick}
      title={title}
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        color: "var(--color-text-secondary, #555)",
        background: "none",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "'Geist', sans-serif",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f3)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div style={{ width: 0.5, height: 18, background: "var(--color-border-tertiary, rgba(0,0,0,0.1))", margin: "0 4px" }} />;
}

/* ── Field wrapper ── */
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))", padding: "0 2rem" }}>
      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary, #aaa)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 52, flexShrink: 0 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="6" cy="6" r="4.5" strokeDasharray="14 8" />
    </svg>
  );
}

/* ── Shared input style ── */
const inputStyle = {
  flex: 1,
  width: "100%",
  padding: "14px 0",
  fontSize: 14,
  color: "var(--color-text-primary, #111)",
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: "'Geist', sans-serif",
  fontWeight: 300,
};