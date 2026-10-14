export default function highlightMatch(text, query) {
  if (!query || !text) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "#FAC775", color: "#412402", borderRadius: 2, padding: "0 1px" }}>{part}</mark>
      : part
  );
}