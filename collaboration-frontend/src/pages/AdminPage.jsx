import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const ROLES = [
  { value: "admin",      label: "Admin",          icon: "👑", color: "#ef4444" },
  { value: "chef_projet",label: "Chef de Projet", icon: "🎯", color: "#f59e0b" },
  { value: "employe",    label: "Employé",        icon: "💼", color: "#38bdf8" },
  { value: "stagiaire",  label: "Stagiaire",      icon: "🎓", color: "#a855f7" },
];

function getRoleInfo(role) {
  return ROLES.find(r => r.value === role) || { label: role, icon: "👤", color: "#64748b" };
}

// ====== MODAL FORM ======
function UserModal({ user, onClose, onSave, loading }) {
  const isEdit = Boolean(user?.id);
  const [name,     setName]     = useState(user?.name     || "");
  const [email,    setEmail]    = useState(user?.email    || "");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState(user?.role     || "employe");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, email, role };
    if (password) payload.password = password;
    if (!isEdit)  payload.password = password || "password";
    onSave(payload);
  };

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={modal.title}>
            {isEdit ? "✏️ Modifier l'utilisateur" : "➕ Nouvel utilisateur"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={modal.label}>Nom complet *</label>
            <input style={modal.input} required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Ahmed Benali" />
          </div>
          <div>
            <label style={modal.label}>Email *</label>
            <input style={modal.input} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ahmed@collaboration.ma" />
          </div>
          <div>
            <label style={modal.label}>
              {isEdit ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe *"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...modal.input, paddingRight: "44px" }}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isEdit ? "••••••••  (optionnel)" : "••••••••"}
                required={!isEdit}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <div>
            <label style={modal.label}>Rôle *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${role === r.value ? r.color : "#334155"}`,
                    background: role === r.value ? `${r.color}18` : "#0f172a",
                    color: role === r.value ? r.color : "#94a3b8",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "11px 18px", background: "#334155", color: "#cbd5e1", border: "1px solid #475569", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
              Annuler
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sauvegarde..." : (isEdit ? "💾 Enregistrer" : "✅ Créer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== MAIN ADMIN PAGE ======
export default function AdminPage() {
  const currentUserId = localStorage.getItem("user_id");
  const role          = localStorage.getItem("role");

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");

  const [showModal,   setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = new

  useEffect(() => {
    document.body.style.background = "#0f172a";
    document.body.style.margin     = "0";
    document.body.style.padding    = "0";

    // حماية: غير Admin ما يقدرش يدخل لهاد الصفحة
    if (role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API}/users`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setErrorMsg("Erreur de chargement des utilisateurs."))
      .finally(() => setLoading(false));
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const isEdit = Boolean(editingUser?.id);
      const url    = isEdit ? `${API}/users/${editingUser.id}` : `${API}/users`;
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la sauvegarde");

      fetchUsers();
      setShowModal(false);
      setEditingUser(null);
      showSuccess(isEdit ? "✅ Utilisateur modifié avec succès !" : "✅ Utilisateur créé avec succès !");
    } catch (err) {
      showError("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (String(user.id) === String(currentUserId)) {
      showError("❌ Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (!window.confirm(`Supprimer "${user.name}" définitivement ?`)) return;
    try {
      const res = await fetch(`${API}/users/${user.id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showSuccess("🗑 Utilisateur supprimé.");
    } catch (err) {
      showError("❌ " + err.message);
    }
  };

  const openCreate = () => { setEditingUser(null); setShowModal(true); };
  const openEdit   = (u)  => { setEditingUser(u);  setShowModal(true); };

  // Stats par rôle
  const stats = ROLES.map(r => ({
    ...r,
    count: users.filter(u => u.role === r.value).length,
  }));

  // Filtrage + recherche
  const filtered = users.filter(u => {
    const matchRole   = filter === "all" || u.role === filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{ background: "#1e293b", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", padding: "0 28px", height: "64px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", gap: "12px" }}>
        <span
          onClick={() => window.location.href = "/dashboard"}
          style={{ color: "#38bdf8", fontWeight: "800", fontSize: "22px", letterSpacing: "-0.5px", cursor: "pointer", marginRight: "8px" }}
        >
          Collabify
        </span>
        <button onClick={() => window.location.href = "/dashboard"}
          style={{ padding: "7px 14px", background: "transparent", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
          🏠 Dashboard
        </button>
        <button
          style={{ padding: "7px 14px", background: "#0f172a", color: "#38bdf8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
          👑 Admin
        </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}
            title="Déconnexion"
          >⏏</button>
        </div>
      </nav>

      {/* ===== MAIN ===== */}
      <div style={{ padding: "32px 40px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: "800", color: "#f8fafc" }}>
              👑 Gestion des Utilisateurs
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            id="btn-new-user"
            onClick={openCreate}
            style={{ padding: "11px 22px", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}
          >
            + Nouvel Utilisateur
          </button>
        </div>

        {/* Messages */}
        {successMsg && (
          <div style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", padding: "13px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", padding: "13px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
            {errorMsg}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {stats.map(s => (
            <div
              key={s.value}
              onClick={() => setFilter(filter === s.value ? "all" : s.value)}
              style={{
                background: filter === s.value ? `${s.color}18` : "#1e293b",
                border: `1px solid ${filter === s.value ? s.color : "#334155"}`,
                borderRadius: "12px",
                padding: "18px 20px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: filter === s.value ? s.color : "#f8fafc" }}>{s.count}</div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Barre de recherche + filtre rôle */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#475569" }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "11px 14px 11px 42px", borderRadius: "10px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", fontSize: "13px", fontWeight: "600", outline: "none", cursor: "pointer" }}
          >
            <option value="all">Tous les rôles</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
          </select>
        </div>

        {/* Table des utilisateurs */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155", color: "#64748b" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👤</div>
            <p style={{ margin: 0 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "16px", overflow: "hidden" }}>
            {/* En-tête table */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr auto", gap: "16px", padding: "14px 24px", borderBottom: "1px solid #334155", background: "#111827" }}>
              {["Nom", "Email", "Rôle", "Actions"].map(h => (
                <div key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
              ))}
            </div>

            {/* Lignes */}
            {filtered.map((user, idx) => {
              const ri = getRoleInfo(user.role);
              const isMe = String(user.id) === String(currentUserId);
              return (
                <div
                  key={user.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1.2fr auto",
                    gap: "16px",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: idx < filtered.length - 1 ? "1px solid #1e293b" : "none",
                    background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"}
                >
                  {/* Nom */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ri.color}60, ${ri.color}30)`, border: `1px solid ${ri.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: ri.color, flexShrink: 0 }}>
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
                        {user.name}
                        {isMe && <span style={{ marginLeft: "6px", fontSize: "10px", background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>Vous</span>}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>{user.email}</div>

                  {/* Rôle */}
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", background: `${ri.color}18`, color: ri.color, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${ri.color}30` }}>
                      {ri.icon} {ri.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      id={`edit-user-${user.id}`}
                      onClick={() => openEdit(user)}
                      style={{ padding: "7px 14px", background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      id={`delete-user-${user.id}`}
                      onClick={() => handleDelete(user)}
                      disabled={isMe}
                      style={{ padding: "7px 14px", background: isMe ? "rgba(100,116,139,0.1)" : "rgba(239,68,68,0.1)", color: isMe ? "#475569" : "#f87171", border: `1px solid ${isMe ? "rgba(100,116,139,0.2)" : "rgba(239,68,68,0.25)"}`, borderRadius: "8px", cursor: isMe ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}

// ===== MODAL STYLES =====
const modal = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  box: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "28px",
    width: "min(500px, 95vw)",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.55)",
  },
  title: { margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#cbd5e1" },
  input: {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1px solid #475569", fontSize: "14px",
    boxSizing: "border-box", background: "#0f172a", color: "#f8fafc", outline: "none",
  },
};
