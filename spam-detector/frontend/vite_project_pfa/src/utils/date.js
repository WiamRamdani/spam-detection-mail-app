export default function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" }); // "Lun", "Mar"…
  } else {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }); // "12 avr."
  }
}