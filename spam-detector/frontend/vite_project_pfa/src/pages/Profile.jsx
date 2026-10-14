import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null); // base64
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get("http://127.0.0.1:8000/profile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setEmail(res.data.email);
      setFullName(res.data.full_name || "");
      setAvatar(res.data.avatar || null);
    });
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result); // base64 string
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    await axios.put("http://127.0.0.1:8000/profile",
      { full_name: fullName, avatar },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const initials = fullName
    ? fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="h-[52px] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 flex-shrink-0">
          <span className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100">Profile</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-w-lg mx-auto w-full">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-2xl font-medium text-neutral-600 dark:text-neutral-300">
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover"/>
                  : initials}
              </div>
              {/* Upload button */}
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M4 4l3-3 3 3" stroke="#f5f0e8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-neutral-900"/>
                  <path d="M1 11h12" stroke="#f5f0e8" strokeWidth="1.4" strokeLinecap="round" className="dark:stroke-neutral-900"/>
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
              </label>
            </div>
            <p className="text-[12px] text-neutral-400 mt-2">Click the icon to change your photo</p>
          </div>

          {/* Fields */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden mb-4">

            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                Full name
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tap to edit your name"
                className="w-full text-[14px] text-neutral-900 dark:text-neutral-100 bg-transparent outline-none placeholder-neutral-300"
              />
            </div>

            <div className="px-5 py-4">
              <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <p className="text-[14px] text-neutral-700 dark:text-neutral-300">
                {email || "Loading…"}
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-xl hover:opacity-85 disabled:opacity-40 transition-opacity"
          >
            {loading ? "Saving…" : success ? "✓ Saved" : "Save changes"}
          </button>

        </div>
      </div>
    </div>
  );
}