"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */
interface User {
  id: string;
  email: string;
  displayName: string;
  pointsBalance: number;
  totalEarned: number;
  surveysCompleted: number;
  level: number;
  xp: number;
  streak: number;
  referralCode: string;
  darkMode: boolean;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  currencyAmount: number;
  status: string;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

type TabName = "home" | "surveys" | "rewards" | "referrals" | "profile";
type AuthView = "login" | "register";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const RAPIDOREACH_APP_ID = "B4RkqLUuAFf";
const POINTS_PER_DOLLAR = 1000;

const SURVEY_CATEGORIES = [
  { name: "Finance", icon: "💰", color: "#10B981", surveys: 12 },
  { name: "Gaming", icon: "🎮", color: "#6366F1", surveys: 8 },
  { name: "Shopping", icon: "🛍️", color: "#EC4899", surveys: 15 },
  { name: "Health", icon: "❤️", color: "#EF4444", surveys: 6 },
  { name: "Technology", icon: "💻", color: "#3B82F6", surveys: 10 },
  { name: "Lifestyle", icon: "🌟", color: "#F59E0B", surveys: 9 },
  { name: "Education", icon: "📚", color: "#8B5CF6", surveys: 7 },
  { name: "Entertainment", icon: "🎬", color: "#F97316", surveys: 11 },
];

const FEATURED_SURVEYS = [
  { id: 1, title: "Consumer Habits Survey", reward: 500, time: "5 min", provider: "MarketPulse", category: "Shopping", icon: "🛒" },
  { id: 2, title: "Tech Usage Patterns", reward: 750, time: "8 min", provider: "TechInsights", category: "Technology", icon: "📱" },
  { id: 3, title: "Health & Wellness", reward: 600, time: "6 min", provider: "HealthTrack", category: "Health", icon: "🏃" },
  { id: 4, title: "Financial Literacy", reward: 1000, time: "12 min", provider: "FinScope", category: "Finance", icon: "📊" },
  { id: 5, title: "Gaming Preferences", reward: 450, time: "4 min", provider: "GamePoll", category: "Gaming", icon: "🎯" },
  { id: 6, title: "Entertainment Trends", reward: 550, time: "5 min", provider: "MediaPulse", category: "Entertainment", icon: "🎭" },
];

const QUICK_REWARDS = [
  { name: "Daily Bonus", icon: "🎁", points: 50, color: "#FF7A1A" },
  { name: "Referral Bonus", icon: "👥", points: 500, color: "#6366F1" },
  { name: "Lucky Draw", icon: "🎰", points: 1000, color: "#EC4899" },
  { name: "Achievements", icon: "🏆", points: 200, color: "#10B981" },
  { name: "Streak Bonus", icon: "🔥", points: 100, color: "#EF4444" },
];

const MISSIONS = [
  { id: 1, title: "Survey Starter", desc: "Complete 5 surveys", reward: 500, progress: 60, icon: "📋" },
  { id: 2, title: "Earnings Pro", desc: "Earn 5,000 points", reward: 1000, progress: 35, icon: "💎" },
  { id: 3, title: "Social Butterfly", desc: "Refer 3 friends", reward: 1500, progress: 33, icon: "🦋" },
  { id: 4, title: "Daily Warrior", desc: "7-day login streak", reward: 700, progress: 71, icon: "⚔️" },
];

const ACHIEVEMENTS = [
  { badge: "🥇", title: "First Survey", desc: "Complete your first survey", unlocked: true },
  { badge: "🔥", title: "On Fire", desc: "3-day login streak", unlocked: true },
  { badge: "💰", title: "Money Maker", desc: "Earn 1,000 points", unlocked: true },
  { badge: "🎯", title: "Sharp Shooter", desc: "Complete 10 surveys", unlocked: false },
  { badge: "👑", title: "King of Surveys", desc: "Complete 50 surveys", unlocked: false },
  { badge: "💎", title: "Diamond Earner", desc: "Earn 50,000 points", unlocked: false },
  { badge: "🌟", title: "Superstar", desc: "Reach Level 10", unlocked: false },
  { badge: "🚀", title: "Rocket Start", desc: "Earn 500 pts in one day", unlocked: false },
];

const LEADERBOARD = [
  { rank: 1, name: "Alex K.", points: 125400, avatar: "🧑‍💼" },
  { rank: 2, name: "Maria S.", points: 98200, avatar: "👩‍💻" },
  { rank: 3, name: "James W.", points: 87500, avatar: "👨‍🎓" },
  { rank: 4, name: "Sarah L.", points: 76300, avatar: "👩‍🔬" },
  { rank: 5, name: "David R.", points: 65100, avatar: "👨‍🚀" },
];

/* ═══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════ */
function pointsToUsd(points: number): string {
  return (points / POINTS_PER_DOLLAR).toFixed(2);
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function xpForLevel(level: number): number {
  return level * 500;
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function SurveyEaseApp() {
  // ── State ──
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [showSurveyWall, setShowSurveyWall] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [refCode, setRefCode] = useState("");

  // Dev sim
  const [simReward, setSimReward] = useState("0.50");

  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast ──
  const showToast = useCallback((message: string, type = "info") => {
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── API helper ──
  const apiFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, { ...options, headers });
      return res;
    },
    [token]
  );

  // ── Load user data ──
  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setToken(null);
        localStorage.removeItem("surveyease_token");
      }
    } catch {
      // ignore
    }
  }, [token, apiFetch]);

  const loadTransactions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/user/transactions");
      if (res.ok) {
        const data = await res.json();
        setTxns(data.transactions || []);
      }
    } catch {
      // ignore
    }
  }, [token, apiFetch]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }, [token, apiFetch]);

  // ── Init ──
  useEffect(() => {
    const saved = localStorage.getItem("surveyease_token");
    if (saved) setToken(saved);
    const dm = localStorage.getItem("surveyease_dark") === "true";
    setDarkMode(dm);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("surveyease_dark", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      loadUser();
      loadTransactions();
      loadNotifications();
    }
  }, [token, loadUser, loadTransactions, loadNotifications]);

  // ── Auth handlers ──
  const handleRegister = async () => {
    if (!email || !password) return showToast("Please fill all fields", "error");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, referralCode: refCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("surveyease_token", data.token);
        setUser(data.user);
        showToast("Welcome to SurveyEase! 🎉 500 bonus points!", "success");
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return showToast("Please fill all fields", "error");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("surveyease_token", data.token);
        setUser(data.user);
        showToast("Welcome back! 👋", "success");
      } else {
        showToast(data.error || "Login failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTxns([]);
    setNotifs([]);
    localStorage.removeItem("surveyease_token");
    setActiveTab("home");
    showToast("Logged out", "info");
  };

  // ── Simulate webhook ──
  const handleSimulate = async () => {
    try {
      const res = await apiFetch("/api/webhooks/simulate", {
        method: "POST",
        body: JSON.stringify({ reward: parseFloat(simReward) }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✅ Simulated! +${data.points} points`, "success");
        loadUser();
        loadTransactions();
        loadNotifications();
      } else {
        showToast(data.error || "Simulation failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  // ── Mark notifications read ──
  const markNotificationsRead = async () => {
    await apiFetch("/api/user/notifications", { method: "PUT" });
    setUnreadCount(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Computed ──
  const xpNeeded = user ? xpForLevel(user.level) : 500;
  const xpProgress = user ? Math.min((user.xp / xpNeeded) * 100, 100) : 0;
  const cashBalance = user ? pointsToUsd(user.pointsBalance) : "0.00";
  const totalCash = user ? pointsToUsd(user.totalEarned) : "0.00";

  /* ═══════════════════════════════════════════════════════
     LOADING SCREEN
     ═══════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "linear-gradient(135deg, #FF7A1A 0%, #FFB74D 100%)" }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "coinBounce 1s ease-in-out infinite" }}>💰</div>
        <h1 style={{ color: "white", fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>SurveyEase</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>Earn rewards for your opinions</p>
        <div style={{ marginTop: 32, width: 48, height: 48, border: "4px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     AUTH SCREENS
     ═══════════════════════════════════════════════════════ */
  if (!token || !user) {
    return (
      <div style={{
        minHeight: "100dvh",
        background: darkMode ? "var(--bg-primary)" : "linear-gradient(180deg, #FFF5EB 0%, #FFFFFF 50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 8, animation: "float 4s ease-in-out infinite" }}>💰</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)", letterSpacing: -1 }}>SurveyEase</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Earn real rewards for sharing your opinions</p>
        </div>

        {/* Auth Card */}
        <div style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--bg-card)",
          borderRadius: "var(--radius)",
          padding: 32,
          boxShadow: "var(--shadow-lg)",
          border: `1px solid var(--border)`,
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "var(--bg-secondary)", borderRadius: "var(--radius-xs)", padding: 4 }}>
            {(["login", "register"] as AuthView[]).map((v) => (
              <button key={v} onClick={() => setAuthView(v)} style={{
                flex: 1, padding: "12px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                background: authView === v ? "var(--primary)" : "transparent",
                color: authView === v ? "white" : "var(--text-secondary)",
              }}>{v === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>

          {authView === "register" && (
            <input
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {authView === "register" && (
            <input
              placeholder="Referral Code (optional)"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              style={inputStyle}
            />
          )}

          <button
            onClick={authView === "login" ? handleLogin : handleRegister}
            disabled={authLoading}
            style={{
              width: "100%", padding: 16, borderRadius: "var(--radius-xs)",
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "white", border: "none", fontSize: 16, fontWeight: 700,
              cursor: authLoading ? "not-allowed" : "pointer",
              opacity: authLoading ? 0.7 : 1, marginTop: 8,
              boxShadow: "0 4px 16px rgba(255,122,26,0.3)",
              transition: "all 0.2s",
            }}
          >
            {authLoading ? "⏳ Please wait..." : authView === "login" ? "Sign In →" : "Create Account →"}
          </button>

          {authView === "register" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: 12, background: "rgba(255,122,26,0.08)", borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Get <b style={{ color: "var(--primary)" }}>500 bonus points</b> on sign up!</span>
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button onClick={() => setDarkMode(!darkMode)} style={{
          marginTop: 20, background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6,
        }}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     SURVEY WALL IFRAME
     ═══════════════════════════════════════════════════════ */
  const surveyWallUrl = `https://www.rapidoreach.com/web_offerwall?app_id=${RAPIDOREACH_APP_ID}&user_id=${user.id}`;

  /* ═══════════════════════════════════════════════════════
     MAIN APP (Authenticated)
     ═══════════════════════════════════════════════════════ */
  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "100dvh", paddingBottom: 90, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--bg-primary)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid var(--border)`,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>💰</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)", letterSpacing: -0.5 }}>SurveyEase</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Points pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg, #FFF5EB, #FFE8D4)",
            padding: "8px 14px", borderRadius: 50,
            border: "1px solid rgba(255,122,26,0.2)",
          }}>
            <span style={{ fontSize: 16 }} className="animate-coin">🪙</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: "var(--primary)" }}>
              {formatNumber(user.pointsBalance)}
            </span>
          </div>

          {/* Streak */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(239,68,68,0.08)", padding: "8px 10px", borderRadius: 50,
          }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#EF4444" }}>{user.streak}</span>
          </div>

          {/* Notifications */}
          <button onClick={() => { setShowNotifPanel(!showNotifPanel); if (!showNotifPanel) markNotificationsRead(); }} style={{
            position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4,
          }}>
            <span style={{ fontSize: 22 }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2, width: 18, height: 18,
                background: "#EF4444", color: "white", borderRadius: "50%",
                fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{unreadCount}</span>
            )}
          </button>

          {/* Avatar */}
          <button onClick={() => setActiveTab("profile")} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: "white", fontSize: 14, fontWeight: 800, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {user.displayName[0]?.toUpperCase()}
          </button>
        </div>
      </header>

      {/* ── Notification Panel ── */}
      {showNotifPanel && (
        <div style={{
          position: "fixed", top: 60, right: 8, left: 8, maxWidth: 460, margin: "0 auto",
          background: "var(--bg-card)", borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-lg)", border: `1px solid var(--border)`,
          zIndex: 200, maxHeight: 400, overflow: "auto",
        }} className="animate-scale-in">
          <div style={{ padding: 16, borderBottom: `1px solid var(--border)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Notifications</h3>
            <button onClick={() => setShowNotifPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
          {notifs.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>🔔</span>
              No notifications yet
            </div>
          ) : (
            notifs.map((n) => (
              <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid var(--border)`, opacity: n.read ? 0.6 : 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════ HOME TAB ══════════════════════ */}
      {activeTab === "home" && (
        <div style={{ padding: "16px 16px 0" }} className="animate-fade-up">
          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Available", value: "24", icon: "📋", color: "#3B82F6" },
              { label: "Completed", value: String(user.surveysCompleted), icon: "✅", color: "#10B981" },
              { label: "Earnings", value: `$${totalCash}`, icon: "💵", color: "#F59E0B" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                padding: "16px 12px", textAlign: "center",
                border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Promo Banner */}
          <div style={{
            background: "linear-gradient(135deg, #FF7A1A 0%, #FFB74D 50%, #FFCF70 100%)",
            borderRadius: "var(--radius)", padding: 24,
            display: "flex", alignItems: "center", gap: 16,
            marginBottom: 20, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -20, top: -20, fontSize: 80, opacity: 0.15, transform: "rotate(15deg)" }}>💰</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>
                Start Earning<br />Today! 🚀
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
                Complete surveys & earn real cash rewards. New surveys added daily!
              </p>
              <button onClick={() => setActiveTab("surveys")} style={{
                marginTop: 12, background: "white", color: "var(--primary)",
                padding: "10px 20px", borderRadius: 50, border: "none",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>
                View Surveys →
              </button>
            </div>
            <div style={{ fontSize: 64 }} className="animate-float">🎯</div>
          </div>

          {/* Level Progress */}
          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
            padding: 16, marginBottom: 18,
            border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>⭐</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Level {user.level}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{user.xp}/{xpNeeded} XP</span>
            </div>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 50, overflow: "hidden" }}>
              <div className="animate-progress" style={{ height: "100%", width: `${xpProgress}%`, background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: 50 }} />
            </div>
          </div>

          {/* Featured Surveys */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700, fontSize: 17 }}>🔥 Featured Surveys</h3>
              <button onClick={() => setActiveTab("surveys")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>See All</button>
            </div>
            <div className="scroll-x">
              {FEATURED_SURVEYS.map((s) => (
                <div key={s.id} style={{
                  minWidth: 200, background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                  padding: 16, border: `1px solid var(--border)`,
                  boxShadow: "var(--shadow)", flexShrink: 0,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{s.provider} · {s.time}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--primary)" }}>+{s.reward} pts</span>
                    <button onClick={() => setShowSurveyWall(true)} style={{
                      background: "var(--primary)", color: "white", border: "none",
                      padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}>Start</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Rewards */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>⚡ Quick Rewards</h3>
            <div className="scroll-x">
              {QUICK_REWARDS.map((r) => (
                <div key={r.name} style={{
                  minWidth: 120, textAlign: "center", background: "var(--bg-card)",
                  borderRadius: "var(--radius-sm)", padding: "16px 12px",
                  border: `1px solid var(--border)`, boxShadow: "var(--shadow)", flexShrink: 0,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16, margin: "0 auto 8px",
                    background: `${r.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>{r.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: r.color }}>+{r.points}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Survey Missions */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>🎯 Survey Missions</h3>
            {MISSIONS.map((m) => (
              <div key={m.id} style={{
                background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                padding: 16, marginBottom: 10,
                border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(255,122,26,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0,
                }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{m.desc}</div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 50, overflow: "hidden" }}>
                    <div className="animate-progress" style={{ height: "100%", width: `${m.progress}%`, background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: 50 }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--primary)" }}>+{m.reward}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.progress}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>📂 Categories</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              {SURVEY_CATEGORIES.map((c) => (
                <button key={c.name} onClick={() => setActiveTab("surveys")} style={{
                  background: "var(--bg-card)", borderRadius: "var(--radius-xs)",
                  padding: "14px 8px", textAlign: "center",
                  border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
                  cursor: "pointer",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: c.color, fontWeight: 700 }}>{c.surveys} surveys</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>📊 Recent Activity</h3>
            {txns.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                padding: 32, textAlign: "center", border: `1px solid var(--border)`,
              }}>
                <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>📭</span>
                <div style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: 14 }}>No activity yet</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Complete a survey to get started!</div>
              </div>
            ) : (
              txns.slice(0, 5).map((tx) => (
                <div key={tx.id} style={{
                  background: "var(--bg-card)", borderRadius: "var(--radius-xs)",
                  padding: "12px 16px", marginBottom: 8,
                  border: `1px solid var(--border)`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>
                      {tx.type === "EARNED_SURVEY" ? "📋" : tx.type === "WITHDRAWAL" ? "💸" : tx.type === "REFERRAL_BONUS" ? "👥" : "🎁"}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.description?.slice(0, 30) || tx.type}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(tx.createdAt)}</div>
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: 14,
                    color: tx.points > 0 ? "var(--success)" : "var(--danger)",
                  }}>
                    {tx.points > 0 ? "+" : ""}{tx.points} pts
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Leaderboard Preview */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>🏆 Leaderboard</h3>
            <div style={{
              background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
              border: `1px solid var(--border)`, overflow: "hidden",
            }}>
              {LEADERBOARD.map((l) => (
                <div key={l.rank} style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                  borderBottom: `1px solid var(--border)`,
                  background: l.rank <= 3 ? `rgba(255,122,26,${0.04 * (4 - l.rank)})` : "transparent",
                }}>
                  <span style={{ fontWeight: 800, fontSize: 14, width: 24, color: l.rank <= 3 ? "var(--primary)" : "var(--text-muted)" }}>
                    {l.rank === 1 ? "🥇" : l.rank === 2 ? "🥈" : l.rank === 3 ? "🥉" : `#${l.rank}`}
                  </span>
                  <span style={{ fontSize: 24 }}>{l.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>{formatNumber(l.points)} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ SURVEYS TAB ══════════════════════ */}
      {activeTab === "surveys" && (
        <div style={{ padding: "16px 16px 0" }} className="animate-fade-up">
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Available Surveys</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Complete surveys to earn points & cash rewards</p>

          {/* Survey Wall Button */}
          <button onClick={() => setShowSurveyWall(true)} style={{
            width: "100%", padding: 18,
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: "white", borderRadius: "var(--radius-sm)", border: "none",
            fontWeight: 700, fontSize: 16, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,122,26,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 20,
          }} className="animate-pulse-glow">
            <span style={{ fontSize: 24 }}>🎯</span>
            Open Survey Wall — Earn Real Rewards
          </button>

          {/* Categories Filter */}
          <div className="scroll-x" style={{ marginBottom: 16 }}>
            {["All", ...SURVEY_CATEGORIES.map(c => c.name)].map((cat, i) => (
              <button key={cat} style={{
                padding: "8px 16px", borderRadius: 50, border: `1px solid var(--border)`,
                background: i === 0 ? "var(--primary)" : "var(--bg-card)",
                color: i === 0 ? "white" : "var(--text-secondary)",
                fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>{cat}</button>
            ))}
          </div>

          {/* Survey List */}
          {FEATURED_SURVEYS.map((s) => (
            <div key={s.id} style={{
              background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
              padding: 16, marginBottom: 12,
              border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(255,122,26,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, flexShrink: 0,
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {s.provider} · {s.time} · {s.category}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--primary)", marginTop: 4 }}>
                  +{s.reward} pts (${pointsToUsd(s.reward)})
                </div>
              </div>
              <button onClick={() => setShowSurveyWall(true)} style={{
                background: "var(--primary)", color: "white", border: "none",
                padding: "10px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>Start</button>
            </div>
          ))}

          {/* More surveys via iframe */}
          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
            padding: 20, marginTop: 8, textAlign: "center",
            border: `1px solid var(--border)`,
          }}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🔍</span>
            <div style={{ fontWeight: 600, fontSize: 14 }}>More surveys available</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Open the Survey Wall to see all available surveys from our partners
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ REWARDS TAB ══════════════════════ */}
      {activeTab === "rewards" && (
        <div style={{ padding: "16px 16px 0" }} className="animate-fade-up">
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Rewards Center</h2>

          {/* Balance Card */}
          <div style={{
            background: "linear-gradient(135deg, #FF7A1A 0%, #FF9A4A 50%, #FFB74D 100%)",
            borderRadius: "var(--radius)", padding: 28, marginBottom: 20,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -30, bottom: -30, fontSize: 120, opacity: 0.1 }}>💰</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600 }}>Available Balance</div>
            <div style={{ color: "white", fontSize: 36, fontWeight: 900, marginTop: 4 }}>
              {formatNumber(user.pointsBalance)} <span style={{ fontSize: 16, fontWeight: 600 }}>pts</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, fontWeight: 600, marginTop: 2 }}>
              ≈ ${cashBalance} USD
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowWithdraw(true)} style={{
                background: "white", color: "var(--primary)", border: "none",
                padding: "10px 24px", borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>Withdraw 💸</button>
              <button onClick={() => setActiveTab("surveys")} style={{
                background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)",
                padding: "10px 24px", borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>Earn More</button>
            </div>
          </div>

          {/* Reward Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total Earned", value: `$${totalCash}`, icon: "💰", color: "#10B981" },
              { label: "Surveys Done", value: String(user.surveysCompleted), icon: "📋", color: "#3B82F6" },
              { label: "Current Level", value: `Lvl ${user.level}`, icon: "⭐", color: "#F59E0B" },
              { label: "XP Points", value: formatNumber(user.xp), icon: "✨", color: "#8B5CF6" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                padding: 16, border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>🏅 Achievements</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {ACHIEVEMENTS.map((a) => (
              <div key={a.title} style={{
                background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                padding: 14, border: `1px solid var(--border)`,
                opacity: a.unlocked ? 1 : 0.4, position: "relative",
              }}>
                {a.unlocked && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: "#10B981", color: "white", fontSize: 8, fontWeight: 800,
                    padding: "2px 6px", borderRadius: 50,
                  }}>UNLOCKED</div>
                )}
                <div style={{ fontSize: 32, marginBottom: 6 }}>{a.badge}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.desc}</div>
              </div>
            ))}
          </div>

          {/* Transaction History */}
          <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>📜 Transaction History</h3>
          {txns.length === 0 ? (
            <div style={{
              background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
              padding: 32, textAlign: "center", border: `1px solid var(--border)`,
            }}>
              <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>📭</span>
              <div style={{ fontWeight: 600, color: "var(--text-muted)" }}>No transactions yet</div>
            </div>
          ) : (
            <div style={{
              background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
              border: `1px solid var(--border)`, overflow: "hidden",
            }}>
              {/* Table Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 80px 80px 60px",
                padding: "10px 14px", background: "var(--bg-secondary)",
                fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase",
              }}>
                <div>Description</div>
                <div style={{ textAlign: "center" }}>Points</div>
                <div style={{ textAlign: "center" }}>Status</div>
                <div style={{ textAlign: "right" }}>Date</div>
              </div>
              {txns.map((tx) => (
                <div key={tx.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 80px 60px",
                  padding: "10px 14px", borderBottom: `1px solid var(--border)`,
                  fontSize: 12, alignItems: "center",
                }}>
                  <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                    {tx.description || tx.type}
                  </div>
                  <div style={{ textAlign: "center", fontWeight: 700, color: tx.points > 0 ? "var(--success)" : "var(--danger)" }}>
                    {tx.points > 0 ? "+" : ""}{tx.points}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 50, fontSize: 10, fontWeight: 700,
                      background: tx.status === "COMPLETED" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: tx.status === "COMPLETED" ? "#10B981" : "#F59E0B",
                    }}>{tx.status}</span>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--text-muted)", fontSize: 11 }}>
                    {timeAgo(tx.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ REFERRALS TAB ══════════════════════ */}
      {activeTab === "referrals" && (
        <div style={{ padding: "16px 16px 0" }} className="animate-fade-up">
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Referral Program</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Invite friends & earn bonus rewards together</p>

          {/* Referral Card */}
          <div style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            borderRadius: "var(--radius)", padding: 24, marginBottom: 20,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -20, top: -20, fontSize: 80, opacity: 0.15 }}>👥</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Your Referral Code</div>
            <div style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16, border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 20, letterSpacing: 2 }}>{user.referralCode}</span>
              <button onClick={() => { navigator.clipboard?.writeText(user.referralCode || ""); showToast("Code copied! 📋", "success"); }} style={{
                background: "white", color: "#6366F1", border: "none",
                padding: "6px 14px", borderRadius: 50, fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}>Copy</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => {
                const shareText = `Join SurveyEase and earn rewards! Use my referral code: ${user.referralCode}\nhttps://surveyease.vercel.app`;
                if (navigator.share) {
                  navigator.share({ title: "SurveyEase", text: shareText }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(shareText);
                  showToast("Share link copied!", "success");
                }
              }} style={{
                background: "white", color: "#6366F1", border: "none",
                padding: "10px 20px", borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>Share Invite 🔗</button>
            </div>
          </div>

          {/* How it works */}
          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
            padding: 20, marginBottom: 20,
            border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>How It Works</h3>
            {[
              { step: 1, title: "Share Your Code", desc: "Send your unique referral code to friends", icon: "📤" },
              { step: 2, title: "Friend Signs Up", desc: "They create an account using your code", icon: "👤" },
              { step: 3, title: "Both Earn Rewards", desc: "You get 500 pts, they get 500 pts welcome bonus!", icon: "🎉" },
            ].map((s) => (
              <div key={s.step} style={{
                display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Step {s.step}: {s.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Referral Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Friends Invited", value: "0", icon: "👥", color: "#6366F1" },
              { label: "Referral Earnings", value: "0 pts", icon: "💎", color: "#8B5CF6" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                padding: 16, border: `1px solid var(--border)`, textAlign: "center",
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════ PROFILE TAB ══════════════════════ */}
      {activeTab === "profile" && (
        <div style={{ padding: "16px 16px 0" }} className="animate-fade-up">
          {/* Profile Header */}
          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius)",
            padding: 24, textAlign: "center", marginBottom: 20,
            border: `1px solid var(--border)`, boxShadow: "var(--shadow)",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "white",
              boxShadow: "0 4px 16px rgba(255,122,26,0.3)",
            }}>
              {user.displayName[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 20 }}>{user.displayName}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <span style={{ padding: "4px 12px", background: "rgba(255,122,26,0.08)", borderRadius: 50, fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
                Level {user.level} ⭐
              </span>
              <span style={{ padding: "4px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 50, fontSize: 12, fontWeight: 700, color: "#EF4444" }}>
                {user.streak} Day Streak 🔥
              </span>
            </div>
          </div>

          {/* Settings */}
          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
            border: `1px solid var(--border)`, overflow: "hidden", marginBottom: 20,
          }}>
            {[
              { label: "Dark Mode", icon: "🌙", action: () => setDarkMode(!darkMode), toggle: true, active: darkMode },
              { label: "Dev Test Panel", icon: "🧪", action: () => setShowDevPanel(!showDevPanel), toggle: true, active: showDevPanel },
              { label: "Notifications", icon: "🔔", action: () => setShowNotifPanel(true) },
              { label: "Transaction History", icon: "📜", action: () => setActiveTab("rewards") },
              { label: "Referral Program", icon: "👥", action: () => setActiveTab("referrals") },
            ].map((item) => (
              <button key={item.label} onClick={item.action} style={{
                width: "100%", padding: "14px 16px", display: "flex", alignItems: "center",
                justifyContent: "space-between", border: "none", borderBottom: `1px solid var(--border)`,
                background: "transparent", cursor: "pointer", color: "var(--text-primary)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                </div>
                {item.toggle ? (
                  <div style={{
                    width: 44, height: 24, borderRadius: 50, padding: 2, cursor: "pointer",
                    background: item.active ? "var(--primary)" : "var(--border)",
                    transition: "all 0.2s",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", background: "white",
                      transform: item.active ? "translateX(20px)" : "translateX(0)",
                      transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }} />
                  </div>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: 18 }}>›</span>
                )}
              </button>
            ))}
          </div>

          {/* Dev Panel */}
          {showDevPanel && (
            <div style={{
              background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
              padding: 20, marginBottom: 20,
              border: "2px dashed var(--primary)", boxShadow: "var(--shadow)",
            }} className="animate-scale-in">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🧪</span>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>Developer Test Panel</h3>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                Simulate a survey completion webhook to test point allocation.
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={simReward}
                  onChange={(e) => setSimReward(e.target.value)}
                  style={{
                    ...inputStyle,
                    marginBottom: 0, flex: 1,
                  }}
                  placeholder="Reward USD"
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                = {formatNumber(Math.round(parseFloat(simReward || "0") * 1000))} points
              </div>
              <button onClick={handleSimulate} style={{
                width: "100%", padding: 12, background: "var(--primary)",
                color: "white", border: "none", borderRadius: "var(--radius-xs)",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>
                🚀 Simulate Survey Completion
              </button>
              <div style={{ marginTop: 14, padding: 12, background: "var(--bg-secondary)", borderRadius: 8, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                <strong>Webhook URL:</strong><br />
                <code style={{ color: "var(--primary)", wordBreak: "break-all" }}>
                  {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/survey-callback?userId={user.id}&transId=TX123&reward=0.50&status=complete
                </code>
              </div>
            </div>
          )}

          {/* App Info */}
          <div style={{
            background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
            padding: 20, marginBottom: 20, textAlign: "center",
            border: `1px solid var(--border)`,
          }}>
            <span style={{ fontSize: 32 }}>💰</span>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginTop: 8 }}>SurveyEase v1.0</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Premium Survey Rewards Platform</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>1000 points = $1.00 USD</p>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            width: "100%", padding: 14, borderRadius: "var(--radius-xs)",
            background: "rgba(239,68,68,0.08)", color: "#EF4444",
            border: "1px solid rgba(239,68,68,0.2)", fontWeight: 700, fontSize: 14, cursor: "pointer",
            marginBottom: 20,
          }}>
            Sign Out →
          </button>
        </div>
      )}

      {/* ══════════════════════ SURVEY WALL MODAL ══════════════════════ */}
      {showSurveyWall && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column",
        }} className="animate-fade-in">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", background: "var(--bg-primary)",
            borderBottom: `1px solid var(--border)`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Survey Wall</span>
            </div>
            <button onClick={() => { setShowSurveyWall(false); loadUser(); loadTransactions(); }} style={{
              background: "var(--danger)", color: "white", border: "none",
              padding: "6px 16px", borderRadius: 50, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>Close ✕</button>
          </div>
          <iframe
            src={surveyWallUrl}
            style={{ flex: 1, width: "100%", border: "none", background: "white" }}
            title="Survey Wall"
            allow="accelerometer; camera; microphone"
          />
        </div>
      )}

      {/* ══════════════════════ WITHDRAW MODAL ══════════════════════ */}
      {showWithdraw && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} className="animate-fade-in" onClick={() => setShowWithdraw(false)}>
          <div style={{
            width: "100%", maxWidth: 480,
            background: "var(--bg-card)", borderRadius: "20px 20px 0 0",
            padding: 24,
          }} className="animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 50, margin: "0 auto 16px" }} />
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Withdraw Funds 💸</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Minimum withdrawal: 5,000 points ($5.00)
            </p>

            <div style={{
              background: "var(--bg-secondary)", borderRadius: "var(--radius-xs)",
              padding: 16, marginBottom: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Your Balance</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)", marginTop: 4 }}>
                {formatNumber(user.pointsBalance)} pts
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>≈ ${cashBalance}</div>
            </div>

            {user.pointsBalance < 5000 ? (
              <div style={{ textAlign: "center", padding: 16, color: "var(--text-muted)", fontSize: 13 }}>
                You need at least 5,000 points to withdraw.
                <br />Earn {5000 - user.pointsBalance} more points!
              </div>
            ) : (
              <button onClick={() => { showToast("Withdrawal request submitted! Processing in 24-48 hours.", "success"); setShowWithdraw(false); }} style={{
                width: "100%", padding: 16, background: "var(--primary)",
                color: "white", border: "none", borderRadius: "var(--radius-xs)",
                fontWeight: 700, fontSize: 16, cursor: "pointer",
              }}>
                Withdraw ${cashBalance} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════ BOTTOM NAV ══════════════════════ */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--navy)", borderRadius: "20px 20px 0 0",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
        zIndex: 100, maxWidth: 480, margin: "0 auto",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
      }}>
        {([
          { id: "home" as TabName, icon: "🏠", label: "Home" },
          { id: "surveys" as TabName, icon: "📋", label: "Surveys" },
          { id: "rewards" as TabName, icon: "🎁", label: "Rewards" },
          { id: "referrals" as TabName, icon: "👥", label: "Referrals" },
          { id: "profile" as TabName, icon: "👤", label: "Profile" },
        ]).map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "6px 12px", borderRadius: 12,
            opacity: activeTab === tab.id ? 1 : 0.5,
            transition: "all 0.2s",
          }}>
            <span style={{
              fontSize: 22,
              filter: activeTab === tab.id ? "none" : "grayscale(0.5)",
              transform: activeTab === tab.id ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s",
            }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.5)",
            }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div style={{
                width: 4, height: 4, borderRadius: "50%", background: "var(--primary)",
                marginTop: 1,
              }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════ */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 12,
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};
