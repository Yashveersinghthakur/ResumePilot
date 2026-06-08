import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────── */
/*  CONFIG                                                  */
/* ─────────────────────────────────────────────────────── */
const API = "http://localhost:5000/api";

const api = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

const apiForm = async (path, formData, token) => {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
};

/* ─────────────────────────────────────────────────────── */
/*  GLOBAL STYLES                                          */
/* ─────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #080c10;
      --bg2: #0d1117;
      --bg3: #141b24;
      --border: rgba(255,255,255,0.07);
      --border-hover: rgba(255,255,255,0.15);
      --accent: #00e5a0;
      --accent2: #0af;
      --accent3: #ff6b6b;
      --text: #e8edf3;
      --text2: #8b95a1;
      --text3: #4a5568;
      --card: rgba(255,255,255,0.03);
      --card-hover: rgba(255,255,255,0.06);
      --glow: 0 0 40px rgba(0,229,160,0.12);
      --radius: 14px;
      --radius-lg: 20px;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      top: -30%;
      left: -20%;
      width: 60%;
      height: 60%;
      background: radial-gradient(ellipse, rgba(0,229,160,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    body::after {
      content: '';
      position: fixed;
      bottom: -20%;
      right: -20%;
      width: 50%;
      height: 50%;
      background: radial-gradient(ellipse, rgba(0,170,255,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; line-height: 1.15; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }

    .page { animation: fadeUp 0.4s ease both; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%,100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes blink {
      0%,100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes shimmer {
      from { background-position: -200% 0; }
      to   { background-position: 200% 0; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 10px; border: none;
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s ease; text-decoration: none;
      white-space: nowrap;
    }
    .btn-primary {
      background: var(--accent); color: #000;
      box-shadow: 0 0 20px rgba(0,229,160,0.25);
    }
    .btn-primary:hover { background: #00ffa8; transform: translateY(-1px); box-shadow: 0 0 30px rgba(0,229,160,0.4); }
    .btn-primary:active { transform: translateY(0); }
    .btn-secondary {
      background: var(--card); color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { background: var(--card-hover); border-color: var(--border-hover); }
    .btn-danger { background: rgba(255,107,107,0.12); color: var(--accent3); border: 1px solid rgba(255,107,107,0.2); }
    .btn-danger:hover { background: rgba(255,107,107,0.2); }
    .btn-sm { padding: 7px 14px; font-size: 13px; }
    .btn-lg { padding: 14px 28px; font-size: 15px; font-weight: 600; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover { border-color: var(--border-hover); }
    .card-glow:hover { box-shadow: var(--glow); }

    input, textarea, select {
      width: 100%; padding: 11px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 10px; color: var(--text);
      font-family: 'DM Sans', sans-serif; font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    input:focus, textarea:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,229,160,0.08);
    }
    input::placeholder, textarea::placeholder { color: var(--text3); }
    textarea { resize: vertical; min-height: 100px; }
    select option { background: var(--bg2); }

    label { display: block; font-size: 13px; color: var(--text2); margin-bottom: 6px; font-weight: 500; }

    .form-group { margin-bottom: 18px; }

    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .badge-green { background: rgba(0,229,160,0.1); color: var(--accent); border: 1px solid rgba(0,229,160,0.2); }
    .badge-blue  { background: rgba(0,170,255,0.1); color: var(--accent2); border: 1px solid rgba(0,170,255,0.2); }
    .badge-red   { background: rgba(255,107,107,0.1); color: var(--accent3); border: 1px solid rgba(255,107,107,0.2); }
    .badge-gray  { background: rgba(255,255,255,0.05); color: var(--text2); border: 1px solid var(--border); }

    .spinner {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.1);
      border-top-color: var(--accent); border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .skeleton {
      background: linear-gradient(90deg, var(--bg3) 25%, rgba(255,255,255,0.05) 50%, var(--bg3) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    .toast-container {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px;
    }
    .toast {
      padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
      display: flex; align-items: center; gap: 10px; min-width: 280px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .toast-success { background: rgba(0,229,160,0.15); border: 1px solid rgba(0,229,160,0.3); color: var(--accent); }
    .toast-error   { background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.3); color: var(--accent3); }
    .toast-info    { background: rgba(0,170,255,0.15); border: 1px solid rgba(0,170,255,0.3); color: var(--accent2); }

    .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    .score-ring svg { transform: rotate(-90deg); }
    .score-ring .label { position: absolute; text-align: center; }

    .tab-bar { display: flex; gap: 4px; background: var(--bg3); border-radius: 12px; padding: 4px; }
    .tab { padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 500;
           color: var(--text2); cursor: pointer; transition: all 0.2s; border: none; background: none; }
    .tab.active { background: var(--card-hover); color: var(--text); border: 1px solid var(--border); }
    .tab:hover:not(.active) { color: var(--text); }

    .divider { height: 1px; background: var(--border); margin: 24px 0; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 24px; text-align: center; gap: 12px;
    }
    .empty-icon { font-size: 48px; opacity: 0.4; }

    .progress-bar {
      height: 6px; background: var(--bg3); border-radius: 99px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
    }

    /* Sidebar layout */
    .layout { display: flex; min-height: 100vh; position: relative; z-index: 1; }
    .sidebar {
      width: 240px; min-height: 100vh; background: var(--bg2);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      position: fixed; top: 0; left: 0; bottom: 0;
      z-index: 100;
    }
    .sidebar-logo {
      padding: 24px 20px 20px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px; font-size: 14px; font-weight: 500;
      color: var(--text2); cursor: pointer; transition: all 0.2s; border: none; background: none;
      text-align: left; width: 100%;
    }
    .nav-item:hover { background: var(--card-hover); color: var(--text); }
    .nav-item.active { background: rgba(0,229,160,0.1); color: var(--accent); border: 1px solid rgba(0,229,160,0.15); }
    .nav-icon { width: 18px; text-align: center; flex-shrink: 0; }
    .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); }

    .main-content {
      margin-left: 240px; flex: 1; min-height: 100vh;
      padding: 32px; max-width: calc(100vw - 240px);
    }

    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 26px; font-weight: 800; }
    .page-header p { color: var(--text2); margin-top: 4px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

    .stat-card { position: relative; overflow: hidden; }
    .stat-card .stat-num { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; }
    .stat-card .stat-label { font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
    .stat-card .stat-icon { position: absolute; right: 20px; top: 20px; font-size: 28px; opacity: 0.15; }

    .chat-container {
      display: flex; flex-direction: column; height: calc(100vh - 200px);
      min-height: 500px;
    }
    .chat-messages {
      flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;
      padding: 20px;
    }
    .chat-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; }
    .bubble-user {
      align-self: flex-end; background: rgba(0,229,160,0.12);
      border: 1px solid rgba(0,229,160,0.2); color: var(--text);
      border-bottom-right-radius: 4px;
    }
    .bubble-ai {
      align-self: flex-start; background: var(--bg3);
      border: 1px solid var(--border); color: var(--text);
      border-bottom-left-radius: 4px;
    }
    .chat-input-row {
      padding: 16px 20px; border-top: 1px solid var(--border);
      display: flex; gap: 10px; align-items: flex-end;
      background: var(--bg2); border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }
    .chat-input-row textarea {
      min-height: 44px; max-height: 120px; resize: none;
    }

    .file-drop {
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg); padding: 40px 24px;
      text-align: center; cursor: pointer; transition: all 0.2s;
    }
    .file-drop:hover, .file-drop.drag { border-color: var(--accent); background: rgba(0,229,160,0.04); }
    .file-drop .drop-icon { font-size: 40px; margin-bottom: 12px; }

    .keyword-chip {
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
      display: inline-block; margin: 3px;
    }
    .chip-match { background: rgba(0,229,160,0.1); color: var(--accent); border: 1px solid rgba(0,229,160,0.2); }
    .chip-miss  { background: rgba(255,107,107,0.08); color: var(--accent3); border: 1px solid rgba(255,107,107,0.15); }

    /* Auth pages */
    .auth-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px; position: relative; z-index: 1;
    }
    .auth-card { width: 100%; max-width: 420px; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
      z-index: 999; display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg);
             width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-header { padding: 24px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

    @media (max-width: 900px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; max-width: 100vw; padding: 20px; }
      .grid-4 { grid-template-columns: 1fr 1fr; }
      .grid-3 { grid-template-columns: 1fr; }
      .grid-2 { grid-template-columns: 1fr; }

  
    }
  `}</style>
);
/* ─────────────────────────────────────────────────────── */
/*  TOAST                                                   */
/* ─────────────────────────────────────────────────────── */
let toastId = 0;
let setToastsGlobal = null;

const toast = {
  success: (msg) => setToastsGlobal?.((t) => [...t, { id: ++toastId, type: "success", msg }]),
  error:   (msg) => setToastsGlobal?.((t) => [...t, { id: ++toastId, type: "error",   msg }]),
  info:    (msg) => setToastsGlobal?.((t) => [...t, { id: ++toastId, type: "info",    msg }]),
};

const Toaster = () => {
  const [toasts, setToasts] = useState([]);
  setToastsGlobal = setToasts;

  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts((p) => p.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [toasts]);

  const icons = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icons[t.type]}</span> {t.msg}
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  SCORE RING                                              */
/* ─────────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 80, strokeWidth = 6 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  const color = score >= 70 ? "#00e5a0" : score >= 40 ? "#0af" : "#ff6b6b";

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ - fill}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="label">
        <div style={{ fontSize: size/4, fontWeight: 800, fontFamily: "Syne, sans-serif", color }}>{score || 0}</div>
        <div style={{ fontSize: size/7, color: "var(--text3)" }}>ATS</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  MODAL                                                   */
/* ─────────────────────────────────────────────────────── */
const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  LOGO                                                    */
/* ─────────────────────────────────────────────────────── */
const Logo = ({ small }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: small ? 30 : 36, height: small ? 30 : 36,
      background: "linear-gradient(135deg, #00e5a0, #0af)",
      borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: small ? 14 : 17, fontWeight: 800, color: "#000",
      flexShrink: 0,
    }}>R</div>
    {!small && <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
      Resume<span style={{ color: "var(--accent)" }}>Pilot</span>
    </span>}
  </div>
);

/* ─────────────────────────────────────────────────────── */
/*  AUTH PAGES                                              */
/* ─────────────────────────────────────────────────────── */
const LoginPage = ({ onLogin, onSwitch }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Welcome back!");
      onLogin(data.token, data.user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card page">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo />
          <h1 style={{ fontSize: 28, marginTop: 24, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "var(--text2)" }}>Sign in to your account</p>
        </div>
        <div className="card">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {loading ? <div className="spinner" /> : "Sign In"}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: "center", color: "var(--text2)", fontSize: 14 }}>
            Don't have an account?{" "}
            <button onClick={onSwitch} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignupPage = ({ onLogin, onSwitch }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Account created!");
      onLogin(data.token, data.user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card page">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo />
          <h1 style={{ fontSize: 28, marginTop: 24, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: "var(--text2)" }}>Start your career journey today</p>
        </div>
        <div className="card">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password <span style={{ color: "var(--text3)" }}>(min 6 chars)</span></label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {loading ? <div className="spinner" /> : "Create Account"}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: "center", color: "var(--text2)", fontSize: 14 }}>
            Already have an account?{" "}
            <button onClick={onSwitch} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  DASHBOARD                                              */
/* ─────────────────────────────────────────────────────── */
const DashboardPage = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/dashboard", {}, token)
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <div className="page-header"><div className="skeleton" style={{ height: 36, width: 200 }} /></div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}
      </div>
      <div className="grid-2">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220 }} />)}
      </div>
    </div>
  );

  const s = data?.stats || {};
  const planColor = s.plan === "pro" ? "badge-green" : s.plan === "teams" ? "badge-blue" : "badge-gray";

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Dashboard</h1>
          <p>Your career progress at a glance</p>
        </div>
        <span className={`badge ${planColor}`} style={{ textTransform: "capitalize", fontSize: 13, padding: "6px 14px" }}>
          ✦ {s.plan} Plan
        </span>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { num: s.totalResumes, label: "Resumes", icon: "📄", color: "var(--accent)" },
          { num: s.avgAtsScore, label: "Avg ATS Score", icon: "📊", color: "var(--accent2)" },
          { num: s.totalInterviews, label: "Interviews", icon: "🎤", color: "#c084fc" },
          { num: s.analysesLeft === "Unlimited" ? "∞" : s.analysesLeft, label: "Analyses Left", icon: "⚡", color: "#fbbf24" },
        ].map((item, i) => (
          <div key={i} className="card stat-card card-glow" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-num" style={{ color: item.color }}>{item.num ?? 0}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Resumes */}
        <div className="card">
          <h3 style={{ fontFamily: "Syne", marginBottom: 16, fontSize: 16 }}>Recent Resumes</h3>
          {data?.recentResumes?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.recentResumes.map((r) => (
                <div key={r._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--bg3)", borderRadius: 10 }}>
                  <div style={{ fontSize: 22 }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12 }}>{r.analyses?.length || 0} analyses</div>
                  </div>
                  {r.latestScore > 0 && <ScoreRing score={r.latestScore} size={46} strokeWidth={4} />}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>No resumes yet</p>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="card">
          <h3 style={{ fontFamily: "Syne", marginBottom: 16, fontSize: 16 }}>Recent Interviews</h3>
          {data?.recentSessions?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.recentSessions.map((s) => (
                <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--bg3)", borderRadius: 10 }}>
                  <div style={{ fontSize: 22 }}>🎤</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.jobTitle}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12 }}>{s.company || "No company"}</div>
                  </div>
                  <span className={`badge ${s.status === "completed" ? "badge-green" : s.status === "active" ? "badge-blue" : "badge-gray"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎙️</div>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>No interviews yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Best score banner */}
      {s.bestAtsScore > 0 && (
        <div className="card" style={{
          marginTop: 20, background: "linear-gradient(135deg, rgba(0,229,160,0.08), rgba(0,170,255,0.08))",
          border: "1px solid rgba(0,229,160,0.2)", display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 40 }}>🏆</div>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>Best ATS Score: <span style={{ color: "var(--accent)" }}>{s.bestAtsScore}</span></div>
            <div style={{ color: "var(--text2)", fontSize: 14 }}>Keep optimizing to land your dream role!</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  RESUME PAGE                                             */
/* ─────────────────────────────────────────────────────── */
const ResumePage = ({ token }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [analyzeModal, setAnalyzeModal] = useState(null);
  const [coverModal, setCoverModal] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [analyzeForm, setAnalyzeForm] = useState({ jobTitle: "", company: "", jobDescription: "" });
  const [coverForm, setCoverForm] = useState({ jobTitle: "", company: "", jobDescription: "" });
  const [coverResult, setCoverResult] = useState("");
  const fileInputRef = useRef();

  const load = () => {
    api("/resume", {}, token)
      .then((d) => setResumes(d.resumes || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      if (title) fd.append("title", title);
      await apiForm("/resume/upload", fd, token);
      toast.success("Resume uploaded!");
      setUploadModal(false);
      setFile(null); setTitle("");
      load();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    if (!analyzeForm.jobDescription) return toast.error("Job description required");
    setAnalyzing(true);
    try {
      const res = await api(`/resume/${analyzeModal._id}/analyze`, {
        method: "POST", body: JSON.stringify(analyzeForm),
      }, token);
      setResultModal(res.analysis);
      setAnalyzeModal(null);
      load();
      toast.success("Analysis complete!");
    } catch (err) { toast.error(err.message); }
    finally { setAnalyzing(false); }
  };

  const handleCoverLetter = async () => {
    if (!coverForm.jobDescription || !coverForm.jobTitle) return toast.error("Job title & description required");
    setAnalyzing(true);
    try {
      const res = await api(`/resume/${coverModal._id}/cover-letter`, {
        method: "POST", body: JSON.stringify(coverForm),
      }, token);
      setCoverResult(res.coverLetter);
      toast.success("Cover letter generated!");
    } catch (err) { toast.error(err.message); }
    finally { setAnalyzing(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await api(`/resume/${id}`, { method: "DELETE" }, token);
      toast.success("Resume deleted");
      load();
    } catch (err) { toast.error(err.message); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Resumes</h1>
          <p>Upload, analyze, and optimize your resumes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setUploadModal(true)}>
          + Upload Resume
        </button>
      </div>

      {loading ? (
        <div className="grid-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📄</div>
          <h3 style={{ fontFamily: "Syne" }}>No resumes yet</h3>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Upload your first resume to get started</p>
          <button className="btn btn-primary" onClick={() => setUploadModal(true)}>Upload Resume</button>
        </div>
      ) : (
        <div className="grid-2">
          {resumes.map((r) => (
            <div key={r._id} className="card card-glow" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "Syne", fontSize: 17, marginBottom: 4 }}>{r.title}</h3>
                  <p style={{ color: "var(--text3)", fontSize: 12 }}>{r.fileName} · {r.analyses?.length || 0} analyses</p>
                </div>
                {r.latestScore > 0 && <ScoreRing score={r.latestScore} size={60} strokeWidth={5} />}
              </div>

              {r.analyses?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Last analysis</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${r.latestScore}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                    <span>{r.analyses[r.analyses.length-1]?.jobTitle || "—"}</span>
                    <span>{r.latestScore}/100</span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setAnalyzeModal(r)}>🔍 Analyze</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setCoverModal(r); setCoverResult(""); }}>✉️ Cover Letter</button>
                <button className="btn btn-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => handleDelete(r._id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => { setUploadModal(false); setFile(null); }}
        title="Upload Resume"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setUploadModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? <><div className="spinner" /> Uploading…</> : "Upload"}
          </button>
        </>}>
        <div
          className={`file-drop ${dragOver ? "drag" : ""}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="drop-icon">{file ? "📄" : "☁️"}</div>
          {file ? (
            <><p style={{ fontWeight: 600 }}>{file.name}</p><p style={{ color: "var(--text2)", fontSize: 13 }}>Click to change</p></>
          ) : (
            <><p style={{ fontWeight: 600 }}>Drop your resume here</p><p style={{ color: "var(--text2)", fontSize: 13 }}>PDF or Word · Max 5MB</p></>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])} />
        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Title (optional)</label>
          <input placeholder="e.g. Software Engineer Resume" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </Modal>

      {/* Analyze Modal */}
      <Modal open={!!analyzeModal} onClose={() => setAnalyzeModal(null)}
        title={`Analyze — ${analyzeModal?.title}`}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setAnalyzeModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <><div className="spinner" /> Analyzing…</> : "Run Analysis"}
          </button>
        </>}>
        <div className="form-group">
          <label>Job Title</label>
          <input placeholder="e.g. Frontend Developer" value={analyzeForm.jobTitle}
            onChange={(e) => setAnalyzeForm({ ...analyzeForm, jobTitle: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Company</label>
          <input placeholder="e.g. Google" value={analyzeForm.company}
            onChange={(e) => setAnalyzeForm({ ...analyzeForm, company: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Job Description <span style={{ color: "var(--accent3)" }}>*</span></label>
          <textarea placeholder="Paste the full job description here…" rows={6} value={analyzeForm.jobDescription}
            onChange={(e) => setAnalyzeForm({ ...analyzeForm, jobDescription: e.target.value })} />
        </div>
      </Modal>

      {/* Cover Letter Modal */}
      <Modal open={!!coverModal} onClose={() => setCoverModal(null)} title={`Cover Letter — ${coverModal?.title}`}
        footer={!coverResult ? <>
          <button className="btn btn-secondary" onClick={() => setCoverModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCoverLetter} disabled={analyzing}>
            {analyzing ? <><div className="spinner" /> Generating…</> : "Generate"}
          </button>
        </> : <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(coverResult); toast.success("Copied!"); }}>📋 Copy</button>}>
        {!coverResult ? (
          <>
            <div className="form-group">
              <label>Job Title <span style={{ color: "var(--accent3)" }}>*</span></label>
              <input placeholder="e.g. Frontend Developer" value={coverForm.jobTitle}
                onChange={(e) => setCoverForm({ ...coverForm, jobTitle: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input placeholder="e.g. Google" value={coverForm.company}
                onChange={(e) => setCoverForm({ ...coverForm, company: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Job Description <span style={{ color: "var(--accent3)" }}>*</span></label>
              <textarea placeholder="Paste the job description…" rows={5} value={coverForm.jobDescription}
                onChange={(e) => setCoverForm({ ...coverForm, jobDescription: e.target.value })} />
            </div>
          </>
        ) : (
          <textarea value={coverResult} readOnly rows={14}
            style={{ fontSize: 13, lineHeight: 1.7, background: "var(--bg3)" }} />
        )}
      </Modal>

      {/* Analysis Result Modal */}
      <Modal open={!!resultModal} onClose={() => setResultModal(null)} title="Analysis Results"
        footer={<button className="btn btn-secondary" onClick={() => setResultModal(null)}>Close</button>}>
        {resultModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ScoreRing score={resultModal.atsScore} size={90} strokeWidth={7} />
              <div>
                <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 800 }}>{resultModal.atsScore}/100</div>
                <div style={{ color: "var(--text2)" }}>ATS Compatibility Score</div>
                {resultModal.jobTitle && <div style={{ color: "var(--text3)", fontSize: 13, marginTop: 2 }}>for {resultModal.jobTitle}</div>}
              </div>
            </div>

            {resultModal.matchedKeywords?.length > 0 && (
              <div>
                <label style={{ marginBottom: 8, display: "block" }}>✅ Matched Keywords</label>
                <div>{resultModal.matchedKeywords.map((k) => <span key={k} className="keyword-chip chip-match">{k}</span>)}</div>
              </div>
            )}

            {resultModal.missingKeywords?.length > 0 && (
              <div>
                <label style={{ marginBottom: 8, display: "block" }}>❌ Missing Keywords</label>
                <div>{resultModal.missingKeywords.map((k) => <span key={k} className="keyword-chip chip-miss">{k}</span>)}</div>
              </div>
            )}

            {resultModal.suggestions?.length > 0 && (
              <div>
                <label style={{ marginBottom: 8, display: "block" }}>💡 Suggestions</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resultModal.suggestions.map((s, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: "var(--bg3)", borderRadius: 10, fontSize: 13, borderLeft: "3px solid var(--accent)" }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {resultModal.skillBreakdown?.length > 0 && (
              <div>
                <label style={{ marginBottom: 10, display: "block" }}>🎯 Skill Breakdown</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resultModal.skillBreakdown.map((sk) => (
                    <div key={sk.skill}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{sk.skill}</span>
                        <span style={{ color: sk.present ? "var(--accent)" : "var(--text3)" }}>{sk.percentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${sk.percentage}%`, background: sk.present ? undefined : "rgba(255,255,255,0.1)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  INTERVIEW PAGE                                          */
/* ─────────────────────────────────────────────────────── */
const InterviewPage = ({ token }) => {
  const [view, setView] = useState("list"); // list | setup | chat | feedback
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [setup, setSetup] = useState({ jobTitle: "", company: "", jobDescription: "", difficulty: "medium" });
  const [session, setSession] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const messagesEndRef = useRef();

  useEffect(() => {
    api("/interview", {}, token)
      .then((d) => setSessions(d.sessions || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const startInterview = async () => {
    if (!setup.jobTitle) return toast.error("Job title required");
    setStarting(true);
    try {
      const data = await api("/interview/start", {
        method: "POST", body: JSON.stringify(setup),
      }, token);
      setSession(data.session);
      setView("chat");
    } catch (err) { toast.error(err.message); }
    finally { setStarting(false); }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");

    // Optimistic update
    setSession((s) => ({ ...s, messages: [...s.messages, { role: "user", content: msg, _id: Date.now() }] }));

    setSending(true);
    try {
      const data = await api(`/interview/${session._id}/message`, {
        method: "POST", body: JSON.stringify({ message: msg }),
      }, token);
      setSession((s) => ({ ...s, messages: [...s.messages, data.message] }));
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const endInterview = async () => {
    if (!confirm("End this interview session?")) return;
    setEnding(true);
    try {
      const data = await api(`/interview/${session._id}/end`, { method: "PUT" }, token);
      setSession((s) => ({ ...s, ...data.session }));
      setView("feedback");
      toast.success("Interview completed!");
    } catch (err) { toast.error(err.message); }
    finally { setEnding(false); }
  };

  const viewSession = async (id) => {
    try {
      const data = await api(`/interview/${id}`, {}, token);
      setSession(data.session);
      setView(data.session.status === "completed" ? "feedback" : "chat");
    } catch (err) { toast.error(err.message); }
  };

  if (view === "setup") return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setView("list")}>← Back</button>
        <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800 }}>New Interview</h1>
      </div>
      <div style={{ maxWidth: 560 }}>
        <div className="card">
          <div className="form-group">
            <label>Job Title <span style={{ color: "var(--accent3)" }}>*</span></label>
            <input placeholder="e.g. Senior Frontend Developer" value={setup.jobTitle}
              onChange={(e) => setSetup({ ...setup, jobTitle: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input placeholder="e.g. Meta" value={setup.company}
              onChange={(e) => setSetup({ ...setup, company: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={setup.difficulty} onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}>
              <option value="easy">Easy — Entry level</option>
              <option value="medium">Medium — Mid level</option>
              <option value="hard">Hard — Senior level</option>
            </select>
          </div>
          <div className="form-group">
            <label>Job Description (optional)</label>
            <textarea placeholder="Paste the job description for more tailored questions…" rows={5} value={setup.jobDescription}
              onChange={(e) => setSetup({ ...setup, jobDescription: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={startInterview} disabled={starting} style={{ width: "100%", justifyContent: "center" }}>
            {starting ? <><div className="spinner" /> Starting…</> : "🎤 Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );

  if (view === "chat" && session) return (
    <div className="page" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "Syne", fontSize: 20 }}>{session.jobTitle}</h2>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>{session.company || "Practice Session"} · <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span></p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-blue" style={{ animation: "pulse 2s infinite" }}>● Live</span>
          <button className="btn btn-danger btn-sm" onClick={endInterview} disabled={ending}>
            {ending ? <div className="spinner" /> : "End Interview"}
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div className="chat-messages">
          {session.messages.map((m, i) => (
            <div key={m._id || i} style={{ display: "flex", flexDirection: "column", animation: "slideIn 0.3s ease" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, paddingLeft: m.role === "user" ? 0 : 0, textAlign: m.role === "user" ? "right" : "left" }}>
                {m.role === "assistant" ? "🤖 AI Interviewer" : "You"}
              </div>
              <div className={`chat-bubble bubble-${m.role === "user" ? "user" : "ai"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>🤖 AI Interviewer</div>
              <div className="chat-bubble bubble-ai" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text3)", animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            placeholder="Type your answer… (Enter to send, Shift+Enter for newline)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !input.trim()}>
            {sending ? <div className="spinner" /> : "Send →"}
          </button>
        </div>
      </div>
    </div>
  );

  if (view === "feedback" && session) return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setView("list"); setSession(null); }}>← Back</button>
        <h1 style={{ fontFamily: "Syne", fontSize: 26 }}>Interview Feedback</h1>
      </div>

      {session.feedback ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(0,229,160,0.08), rgba(0,170,255,0.08))", border: "1px solid rgba(0,229,160,0.2)", display: "flex", alignItems: "center", gap: 24 }}>
            <ScoreRing score={(session.feedback.overallScore || 0) * 10} size={100} strokeWidth={8} />
            <div>
              <div style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800 }}>{session.feedback.overallScore}/10</div>
              <div style={{ color: "var(--text2)" }}>Overall Performance</div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{session.jobTitle} at {session.company || "—"}</div>
            </div>
          </div>

          {session.feedback.summary && (
            <div className="card">
              <h3 style={{ fontFamily: "Syne", marginBottom: 12, fontSize: 16 }}>📋 Summary</h3>
              <p style={{ color: "var(--text2)", lineHeight: 1.7 }}>{session.feedback.summary}</p>
            </div>
          )}

          <div className="grid-2">
            {session.feedback.strengths?.length > 0 && (
              <div className="card" style={{ borderColor: "rgba(0,229,160,0.2)" }}>
                <h3 style={{ fontFamily: "Syne", marginBottom: 12, fontSize: 16, color: "var(--accent)" }}>✅ Strengths</h3>
                <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {session.feedback.strengths.map((s, i) => <li key={i} style={{ color: "var(--text2)", fontSize: 14 }}>{s}</li>)}
                </ul>
              </div>
            )}
            {session.feedback.improvements?.length > 0 && (
              <div className="card" style={{ borderColor: "rgba(255,107,107,0.2)" }}>
                <h3 style={{ fontFamily: "Syne", marginBottom: 12, fontSize: 16, color: "var(--accent3)" }}>📈 Improvements</h3>
                <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {session.feedback.improvements.map((s, i) => <li key={i} style={{ color: "var(--text2)", fontSize: 14 }}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-icon">📊</div>
          <p style={{ color: "var(--text2)" }}>No detailed feedback available for this session</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Interviews</h1>
          <p>Practice and track your interview sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView("setup")}>+ New Interview</button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🎤</div>
          <h3 style={{ fontFamily: "Syne" }}>No interviews yet</h3>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Practice your interview skills with AI</p>
          <button className="btn btn-primary" onClick={() => setView("setup")}>Start Practice</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((s) => (
            <div key={s._id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
              onClick={() => viewSession(s._id)}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>
                {s.status === "completed" ? "✅" : s.status === "active" ? "🎤" : "💤"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontFamily: "Syne", fontSize: 15 }}>{s.jobTitle}</div>
                <div style={{ color: "var(--text3)", fontSize: 13 }}>{s.company || "No company"} · <span style={{ textTransform: "capitalize" }}>{s.difficulty}</span></div>
              </div>
              {s.feedback?.overallScore && (
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "var(--accent)" }}>{s.feedback.overallScore}<span style={{ fontSize: 13, color: "var(--text3)" }}>/10</span></div>
              )}
              <span className={`badge ${s.status === "completed" ? "badge-green" : s.status === "active" ? "badge-blue" : "badge-gray"}`}>
                {s.status}
              </span>
              <span style={{ color: "var(--text3)" }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  PROFILE PAGE                                            */
/* ─────────────────────────────────────────────────────── */
const ProfilePage = ({ token, user, onUpdate }) => {
  const [profile, setProfile] = useState({ name: user?.name || "", avatar: user?.avatar || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = await api("/auth/update-profile", {
        method: "PUT", body: JSON.stringify(profile),
      }, token);
      onUpdate(data.user);
      toast.success("Profile updated!");
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pw.currentPassword || !pw.newPassword) return toast.error("Fill in both fields");
    setChangingPw(true);
    try {
      await api("/auth/change-password", {
        method: "PUT", body: JSON.stringify(pw),
      }, token);
      toast.success("Password changed!");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) { toast.error(err.message); }
    finally { setChangingPw(false); }
  };

  const planInfo = {
    starter: { label: "Starter", color: "var(--text2)", limit: "3 analyses/month" },
    pro: { label: "Pro", color: "var(--accent)", limit: "Unlimited analyses" },
    teams: { label: "Teams", color: "var(--accent2)", limit: "Unlimited everything" },
  };
  const plan = planInfo[user?.plan] || planInfo.starter;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Avatar & Name */}
        <div className="card">
          <h3 style={{ fontFamily: "Syne", marginBottom: 20, fontSize: 16 }}>Personal Info</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "#000", fontFamily: "Syne",
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>{user?.email}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 13, color: plan.color, fontWeight: 600 }}>✦ {plan.label}</span>
                <span style={{ color: "var(--text3)", fontSize: 12, marginLeft: 8 }}>{plan.limit}</span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Avatar URL (optional)</label>
            <input placeholder="https://…" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? <><div className="spinner" /> Saving…</> : "Save Changes"}
          </button>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 style={{ fontFamily: "Syne", marginBottom: 20, fontSize: 16 }}>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Min 6 characters" value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <button className="btn btn-secondary" onClick={changePassword} disabled={changingPw}>
            {changingPw ? <><div className="spinner" /> Updating…</> : "Update Password"}
          </button>
        </div>

        {/* Plan info */}
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(0,229,160,0.06), rgba(0,170,255,0.06))", border: "1px solid rgba(0,229,160,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontFamily: "Syne", fontSize: 16, marginBottom: 4 }}>Your Plan: <span style={{ color: plan.color }}>{plan.label}</span></h3>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>{plan.limit}</p>
            </div>
            {user?.plan === "starter" && (
              <button className="btn btn-primary btn-sm">Upgrade to Pro →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  SIDEBAR                                                 */
/* ─────────────────────────────────────────────────────── */
const Sidebar = ({ page, setPage, user, onLogout }) => {
  const nav = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "resumes",   icon: "📄", label: "Resumes" },
    { id: "interviews",icon: "🎤", label: "Interviews" },
    { id: "profile",   icon: "👤", label: "Profile" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo />
      </div>
      <nav className="sidebar-nav">
        {nav.map((item) => (
          <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#000", fontFamily: "Syne",
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "capitalize" }}>{user?.plan} plan</div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout} style={{ color: "var(--accent3)", width: "100%" }}>
          <span className="nav-icon">↪</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  APP                                                     */
/* ─────────────────────────────────────────────────────── */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("rp_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rp_user")); } catch { return null; }
  });
  const [authView, setAuthView] = useState("login"); // login | signup
  const [page, setPage] = useState("dashboard");

  const handleLogin = (tok, usr) => {
    localStorage.setItem("rp_token", tok);
    localStorage.setItem("rp_user", JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const handleLogout = () => {
    localStorage.removeItem("rp_token");
    localStorage.removeItem("rp_user");
    setToken(null);
    setUser(null);
  };

  const handleUpdateUser = (usr) => {
    localStorage.setItem("rp_user", JSON.stringify(usr));
    setUser(usr);
  };

  // Verify token on mount
  useEffect(() => {
    if (!token) return;
    api("/auth/me", {}, token)
      .then((d) => setUser(d.user))
      .catch(() => handleLogout());
  }, []);

  return (
    <>
      <GlobalStyle />
      <Toaster />
      <ChatWidget />

      {!token ? (
        authView === "login"
          ? <LoginPage onLogin={handleLogin} onSwitch={() => setAuthView("signup")} />
          : <SignupPage onLogin={handleLogin} onSwitch={() => setAuthView("login")} />
      ) : (
        <div className="layout">
          <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
          <main className="main-content">
            {page === "dashboard"  && <DashboardPage token={token} />}
            {page === "resumes"    && <ResumePage token={token} />}
            {page === "interviews" && <InterviewPage token={token} />}
            {page === "profile"    && <ProfilePage token={token} user={user} onUpdate={handleUpdateUser} />}
          </main>
        </div>
      )}
    </>
  );
}



function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I am ResumePilot AI. Ask me anything about resumes or interviews.",
    },
  ]);

  const sendMessage = async () => {
  if (!message.trim()) return;

  const userText = message;

  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: userText,
    },
  ]);

  setMessage("");

  try {
    const res = await fetch(
      "http://localhost:5000/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
        }),
      }
    );

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: data.reply,
      },
    ]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Server error",
      },
    ]);
  }
};

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          border: "none",
          background: "#00e5a0",
          color: "#000",
          fontSize: "28px",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 0 20px rgba(0,229,160,.4)"
        }}
      >
        💬
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "95px",
            right: "20px",
            width: "350px",
            height: "500px",
            background: "#141b24",
            borderRadius: "15px",
            border: "1px solid rgba(255,255,255,.1)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              padding: "15px",
              background: "#00e5a0",
              color: "#000",
              fontWeight: "bold"
            }}
          >
            ResumePilot AI
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px"
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign:
                    msg.sender === "user"
                      ? "right"
                      : "left",
                  marginBottom: "10px"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "10px",
                    background:
                      msg.sender === "user"
                        ? "#00e5a0"
                        : "#222",
                    color:
                      msg.sender === "user"
                        ? "#000"
                        : "#fff"
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              padding: "10px"
            }}
          >
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask something..."
              style={{ flex: 1 }}
            />

            <button
              onClick={sendMessage}
              style={{
                marginLeft: "10px",
                background: "#00e5a0",
                border: "none",
                padding: "10px"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
