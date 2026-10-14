import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");
  const [stats, setStats] = useState(null);
  const [topSenders, setTopSenders] = useState([]);

  useEffect(() => {
    if (!user_id) { navigate("/login"); return; }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get("http://127.0.0.1:8000/dashboard/stats", { headers }),
      axios.get("http://127.0.0.1:8000/dashboard/top-senders", { headers }),
    ]).then(([statsRes, sendersRes]) => {
      setStats(statsRes.data);
      setTopSenders(sendersRes.data);
    }).catch(err => {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    });
  }, [user_id, navigate]);

  if (!stats) {
    return (
      <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Loading…
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Inbox", value: stats.total_received - stats.total_spam },
    { name: "Spam", value: stats.total_spam },
  ];

  const PIE_COLORS = ["#1D9E75", "#D85A30"];

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Header title="Dashboard" />

        <div className="overflow-y-auto flex-1 p-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Received" value={stats.total_received} />
            <StatCard label="Sent" value={stats.total_sent} />
            <StatCard label="Spam detected" value={stats.total_spam} accent="#D85A30" />
            <StatCard label="Spam rate" value={`${stats.spam_rate.toFixed(1)}%`} accent="#D85A30" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Daily bar chart */}
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Emails received (last 7 days)
              </p>
              {stats.daily.length === 0 ? (
                <p className="text-[12px] text-neutral-400 py-8 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "0.5px solid #e5e5e5" }}
                    />
                    <Bar dataKey="ham" stackId="a" fill="#1D9E75" radius={[0, 0, 0, 0]} name="Not spam" />
                    <Bar dataKey="spam" stackId="a" fill="#D85A30" radius={[4, 4, 0, 0]} name="Spam" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Inbox composition
              </p>
              {stats.total_received === 0 ? (
                <p className="text-[12px] text-neutral-400 py-8 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "0.5px solid #e5e5e5" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

            {/* Top senders */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Top senders
              </p>
              {topSenders.length === 0 ? (
                <p className="text-[12px] text-neutral-400 py-4 text-center">No data yet</p>
              ) : (
                <div className="space-y-2.5">
                  {topSenders.map((s) => {
                    const max = topSenders[0].count;
                    const pct = (s.count / max) * 100;
                    return (
                      <div key={s.email}>
                        <div className="flex items-center justify-between text-[12px] mb-1">
                          <span className="text-neutral-700 dark:text-neutral-300 truncate">{s.email}</span>
                          <span className="text-neutral-400 flex-shrink-0 ml-2">{s.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI model insight */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Model insights
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-500">Average spam probability</span>
                  <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {stats.avg_probability.toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-500">Manual corrections made</span>
                  <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {stats.total_corrected}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-500">Total emails analyzed</span>
                  <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {stats.total_received}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
      <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-[24px] font-medium" style={{ color: accent || "var(--color-text-primary, #111)" }}>
        {value}
      </p>
    </div>
  );
}