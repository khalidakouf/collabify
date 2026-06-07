import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ========== HOOK RESPONSIVE ==========
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return isMobile;
}

// ========== KANBAN BOARD ==========
function KanbanBoard({ tasks, onStatusChange }) {
  const columns = [
    { key: "a_faire",  label: "À faire",  bg: "#1e293b", border: "rgba(99, 102, 241, 0.2)", accent: "#818cf8", dot: "#6366f1" },
    { key: "en_cours", label: "En cours", bg: "#1e293b", border: "rgba(168, 85, 247, 0.2)", accent: "#c084fc", dot: "#a855f7" },
    { key: "termine",  label: "Terminé",  bg: "#1e293b", border: "rgba(34, 197, 94, 0.2)", accent: "#4ade80", dot: "#22c55e" },
  ];
  
  const priorityColor = (p) =>
    p === "haute" ? "#ef4444" : p === "moyenne" ? "#eab308" : "#22c55e";

  const priorityLabel = (p) =>
    p === "haute" ? "Urgente" : p === "moyenne" ? "Moyenne" : "Basse";

  return (
    <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "repeat(3, 1fr)", gap: "20px", marginTop: "10px" }}>
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} style={{ background: "#111827", border: `1px solid ${col.border}`, borderRadius: "12px", padding: "16px", minHeight: "500px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.dot }} />
              <span style={{ fontWeight: "700", fontSize: "15px", color: "#f8fafc" }}>{col.label}</span>
              <span style={{ marginLeft: "auto", background: col.border, color: col.accent, fontSize: "12px", fontWeight: "700", padding: "2px 10px", borderRadius: "20px" }}>
                {colTasks.length}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              {colTasks.map(task => (
                <div key={task.id} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "14px", color: "#f8fafc", lineHeight: "1.4" }}>{task.title}</strong>
                    <span style={{ fontSize: "10px", fontWeight: "700", background: `${priorityColor(task.priority)}22`, color: priorityColor(task.priority), padding: "2px 8px", borderRadius: "6px", border: `1px solid ${priorityColor(task.priority)}44`, whiteSpace: "nowrap" }}>
                      {priorityLabel(task.priority)}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 12px", lineHeight: "1.5" }}>{task.description}</p>
                  )}
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", gap: "10px" }}>
                    {task.assignee_name ? (
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "700" }} title={task.assignee_name}>
                        {task.assignee_name.substring(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Non assigné</div>
                    )}
                    
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value)}
                      style={{ padding: "6px 10px", fontSize: "12px", border: "1px solid #334155", borderRadius: "8px", background: "#0f172a", cursor: "pointer", color: "#cbd5e1", outline: "none" }}
                    >
                      <option value="a_faire">📋 À Faire</option>
                      <option value="en_cours">⚡ En Cours</option>
                      <option value="termine">✅ Terminé</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== STEP 1 FORM ==========
function Step1Form({ onNext }) {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline]       = useState("");
  const [nbTasks, setNbTasks]         = useState(3);

  const submit = (e) => {
    e.preventDefault();
    onNext({ title, description, deadline, nbTasks: parseInt(nbTasks) });
  };

  return (
    <div style={modalBox}>
      <h3 style={modalTitle}>📁 Nouveau Projet — Étape 1/2</h3>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={labelSt}>Titre du projet *</label>
          <input style={inputSt} value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Refonte Site Web" />
        </div>
        <div>
          <label style={labelSt}>Description</label>
          <textarea style={{ ...inputSt, minHeight: "72px", resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Objectif du projet..." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelSt}>Deadline</label>
            <input style={inputSt} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div>
            <label style={labelSt}>Nombre de tâches *</label>
            <input style={inputSt} type="number" min="1" max="20" value={nbTasks} onChange={e => setNbTasks(e.target.value)} required />
          </div>
        </div>
        <button type="submit" style={btnPrimary}>Suivant →</button>
      </form>
    </div>
  );
}

// ========== STEP 2 FORM ==========
function Step2Form({ projectData, users, onCreate, onBack, loading }) {
  const [tasks, setTasks] = useState(
    Array.from({ length: projectData.nbTasks }, () => ({
      title: "", description: "", priority: "moyenne", deadline: "", assigned_to: "",
    }))
  );
  const update = (i, field, value) =>
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const employes = users.filter(u => u.role === "employe" || u.role === "stagiaire");

  return (
    <div style={{ ...modalBox, maxWidth: "660px", maxHeight: "82vh", overflowY: "auto" }}>
      <h3 style={modalTitle}>📝 Configurer les Tâches — Étape 2/2</h3>
      <p style={{ color: "#94a3b8", fontSize: "13px", margin: "-8px 0 16px" }}>
        Projet : <strong style={{ color: "#f8fafc" }}>{projectData.title}</strong>
      </p>
      <form onSubmit={e => { e.preventDefault(); onCreate(tasks); }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8", marginBottom: "10px" }}>Tâche {i + 1}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input style={inputSt} value={task.title} onChange={e => update(i, "title", e.target.value)} required placeholder="Nom de la tâche *" />
              <input style={inputSt} value={task.description} onChange={e => update(i, "description", e.target.value)} placeholder="Description (optionnel)" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelSt}>Priorité</label>
                  <select style={inputSt} value={task.priority} onChange={e => update(i, "priority", e.target.value)}>
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">🟢 Basse</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Assigné à</label>
                  <select style={inputSt} value={task.assigned_to} onChange={e => update(i, "assigned_to", e.target.value)}>
                    <option value="">-- Non assigné --</option>
                    {employes.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role === "employe" ? "Employé" : "Stagiaire"})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button type="button" onClick={onBack} style={btnSecondary}>← Retour</button>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Création en cours..." : "✅ Créer le Projet"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== MAIN DASHBOARD ==========
export default function Dashboard() {
  const name  = localStorage.getItem("user_name");
  const role  = localStorage.getItem("role");
  const isMobile = useIsMobile();

  const [projects,        setProjects]        = useState([]);
  const [users,           setUsers]           = useState([]);
  const [notifications,   setNotifications]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks,           setTasks]           = useState([]);
  const [showModal,       setShowModal]       = useState(false);
  const [step,            setStep]            = useState(1);
  const [projectData,     setProjectData]     = useState(null);
  const [creating,        setCreating]        = useState(false);
  const [successMsg,      setSuccessMsg]      = useState("");

  // Modals Modification & Ajout Tâche Rapide
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // States Modification
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStatus, setEditStatus] = useState("en_cours");
  const [deleting, setDeleting] = useState(false);

  // States Ajout Tâche unique
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("moyenne");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  const fetchProjects = () =>
    fetch(`${API}/projects`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : []));

  const fetchTasksOfProject = (projectId) => {
    fetch(`${API}/tasks?project_id=${projectId}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setTasks(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  useEffect(() => {
    // إزالة أي خلفيات بيضاء عامة في الـ HTML Body لضمان اللون الأسود الكامل في الجوانب
    document.body.style.background = "#0f172a";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    Promise.all([
      fetch(`${API}/projects`,      { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API}/users`,         { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API}/notifications`, { headers: authHeaders() }).then(r => r.json()),
    ])
    .then(([proj, usr, notif]) => {
      setProjects(Array.isArray(proj)  ? proj  : []);
      setUsers(Array.isArray(usr)      ? usr   : []);
      setNotifications(Array.isArray(notif) ? notif : []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    fetchTasksOfProject(selectedProject.id);
  }, [selectedProject]);

  const handleStatusChange = (taskId, newStatus) => {
    fetch(`${API}/tasks/${taskId}/status`, {
      method: "PUT", headers: authHeaders(),
      body: JSON.stringify({ status: newStatus }),
    })
    .then(r => r.json())
    .then(() => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleCreate = async (tasksList) => {
    setCreating(true);
    try {
      const response = await fetch(`${API}/projects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: projectData.title,
          description: projectData.description,
          deadline: projectData.deadline || null,
          tasks: tasksList.filter(t => t.title && t.title.trim() !== ""), 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur lors de la création");

      fetchProjects(); 
      setTasks(data.tasks); 
      setSelectedProject(data.project); 
      
      setShowModal(false);
      setStep(1);
      setProjectData(null);

      setSuccessMsg("Projet initialisé avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleAddTaskInline = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          project_id: selectedProject.id,
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
          assigned_to: newTaskAssignee || null,
          status: "a_faire"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'ajout de la tâche");

      fetchTasksOfProject(selectedProject.id);
      setShowAddTaskModal(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("moyenne");
      setNewTaskAssignee("");
      setSuccessMsg("Nouvelle tâche ajoutée avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingTask(false);
    }
  };

  const openEditModal = (e) => {
    e.stopPropagation();
    if (!selectedProject) return;
    setEditTitle(selectedProject.title);
    setEditDescription(selectedProject.description || "");
    setEditDeadline(selectedProject.deadline || "");
    setEditStatus(selectedProject.status || "en_cours");
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          deadline: editDeadline || null,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la modification");

      setSelectedProject(data.project);
      fetchProjects(); 
      setShowEditModal(false);
      setSuccessMsg("Projet modifié avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet et toutes ses tâches définitivement ?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/projects/${selectedProject.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setSelectedProject(null);
      setTasks([]);
      fetchProjects();
      setSuccessMsg("Projet supprimé avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };
  
  const unread = notifications.filter(n => !n.is_read).length;
  const employesList = users.filter(u => u.role === "employe" || u.role === "stagiaire");

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", minHeight: "100vh", margin: 0, padding: 0, fontFamily: "'Segoe UI', Roboto, sans-serif", background: "#0f172a", color: "#f8fafc", boxSizing: "border-box", overflowX: "hidden" }}>

      {/* ===== NAVBAR CLEAN — NO PROJECTS INSIDE ===== */}
      <nav style={{ width: "100%", background: "#1e293b", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", padding: "0 24px", height: "64px", boxSizing: "border-box", zIndex: 100, boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
        
        {/* Logo لي تيرجعك للرئيسية */}
        <span onClick={() => { setSelectedProject(null); setTasks([]); }} style={{ color: "#38bdf8", fontWeight: "800", fontSize: "22px", letterSpacing: "-0.5px", cursor: "pointer", marginRight: "20px" }}>
          Collabify
        </span>

        {/* زر Dashboard نقي حدا اللوغو مباشرة */}
        <button onClick={() => { setSelectedProject(null); setTasks([]); }} style={navBtn(!selectedProject)}>
          🏠 Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
          {unread > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px" }}>
              🔔 {unread}
            </span>
          )}

          {(role === "chef_projet" || role === "admin") && (
            <button onClick={() => { setShowModal(true); setStep(1); }} style={btnPrimary}>
              + Nouveau Projet
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderLeft: "1px solid #334155", paddingLeft: "15px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: "700" }}>
              {name?.[0]?.toUpperCase()}
            </div>
            {!isMobile && (
              <div style={{ lineHeight: "1.2" }}>
                <div style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "600" }}>{name}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>{role?.replace("_", " ")}</div>
              </div>
            )}
            <button onClick={handleLogout} title="Déconnexion" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", marginLeft: "5px" }}>
              ⏏
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTAINER (FULL WIDTH / BACKGROUND BLACK NOIR) ===== */}
      <div style={{ width: "100%", padding: isMobile ? "20px 16px" : "32px 40px", boxSizing: "border-box", flex: 1, background: "#0f172a" }}>

        {successMsg && (
          <div style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
            {successMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px", color: "#94a3b8" }}>Chargement en cours...</div>
        ) : selectedProject ? (
          
          /* =========================================================
             📊 VIEW: KANBAN BOARD
             ========================================================= */
          <div style={{ width: "100%" }}>
            
            <div style={{ background: "#1e293b", border: "1px solid #334155", padding: "24px", borderRadius: "16px", marginBottom: "20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "24px", color: "#f8fafc", fontWeight: "800" }}>{selectedProject.title}</h2>
                  {selectedProject.description && (
                    <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>{selectedProject.description}</p>
                  )}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {(role === "admin" || selectedProject.chef_id == localStorage.getItem("user_id") || selectedProject.chef_id === null) && (
                    <>
                      <button onClick={openEditModal} style={btnSecondaryText}>
                        Modifier le projet
                      </button>
                      <button onClick={handleDeleteProject} disabled={deleting} style={btnDangerText}>
                        Supprimer le projet
                      </button>
                    </>
                  )}
                  <button onClick={() => { setSelectedProject(null); setTasks([]); }} style={btnSecondary}>
                    ← Retour
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #334155", marginTop: "20px", paddingTop: "16px" }}>
                <button onClick={() => setShowAddTaskModal(true)} style={{ ...btnPrimary, background: "#a855f7", boxShadow: "0 4px 6px -1px rgba(168,85,247,0.4)" }}>
                  + Nouvelle Tâche
                </button>
              </div>
            </div>
            
            <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
          </div>

        ) : (
          
          /* =========================================================
             📁 VIEW: PROJECTS GRID 
             ========================================================= */
          <div style={{ width: "100%" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "20px", color: "#f8fafc", fontWeight: "800" }}>
              Mes Projets Merveilleux ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155", color: "#94a3b8" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
                <p style={{ margin: "0", fontSize: "15px" }}>Aucun projet assigné pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", width: "100%" }}>
                {projects.map(p => (
                  <div key={p.id} onClick={() => setSelectedProject(p)}
                    style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "24px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#334155";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", gap: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "18px", color: "#f8fafc", fontWeight: "700" }}>{p.title}</h3>
                      <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: p.status === "termine" ? "rgba(34,197,94,0.2)" : "rgba(56,189,248,0.2)", color: p.status === "termine" ? "#4ade80" : "#38bdf8", fontWeight: "700", textTransform: "uppercase" }}>
                        {p.status?.replace("_", " ")}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", height: "44px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {p.description || "Aucune description fournie pour ce projet."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #334155", paddingTop: "14px" }}>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {p.deadline ? `📅 ${p.deadline}` : "Pas de deadline"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#38bdf8", fontWeight: "700" }}>Voir Board →</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================
         ✏️ MODAL: MODIFIER LE PROJET
         ========================================================= */}
      {showEditModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={modalTitle}>Modifier le Projet</h3>
            <form onSubmit={handleUpdateProject} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelSt}>Titre du projet *</label>
                <input style={inputSt} type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label style={labelSt}>Description</label>
                <textarea style={{ ...inputSt, minHeight: "80px" }} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div>
                <label style={labelSt}>Date limite (Deadline)</label>
                <input style={inputSt} type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} />
              </div>
              <div>
                <label style={labelSt}>Statut du Projet</label>
                <select style={inputSt} value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="en_cours">🔄 En Cours</option>
                  <option value="termine">✅ Terminé</option>
                  <option value="annule">❌ Annulé</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={btnSecondary}>Annuler</button>
                <button type="submit" style={{ ...btnPrimary, flex: 1 }}>Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
         ➕ MODAL: NOUVELLE TÂCHE RAPIDE
         ========================================================= */}
      {showAddTaskModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={modalTitle}>+ Ajouter une nouvelle tâche</h3>
            <form onSubmit={handleAddTaskInline} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelSt}>Nom de la tâche *</label>
                <input style={inputSt} type="text" required placeholder="Ex: Développer l'API de Login" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
              </div>
              <div>
                <label style={labelSt}>Description (Optionnelle)</label>
                <textarea style={{ ...inputSt, minHeight: "70px" }} placeholder="Détails de la tâche..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelSt}>Priorité</label>
                  <select style={inputSt} value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">🟢 Basse</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Assigner à</label>
                  <select style={inputSt} value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}>
                    <option value="">-- Non assigné --</option>
                    {employesList.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} style={btnSecondary}>Annuler</button>
                <button type="submit" disabled={addingTask} style={{ ...btnPrimary, background: "#a855f7", flex: 1 }}>
                  {addingTask ? "Ajout..." : "Ajouter la tâche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL DE CREATION INITIALE (STEP 1 & 2) ===== */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={{ position: "relative" }}>
            {step === 1 && <Step1Form onNext={d => { setProjectData(d); setStep(2); }} />}
            {step === 2 && <Step2Form projectData={projectData} users={users} onCreate={handleCreate} onBack={() => setStep(1)} loading={creating} />}
          </div>
        </div>
      )}

    </div>
  );
}

// ========== STYLES MIGRATED TO FULL DARK ==========
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" };
const modalBox     = { background: "#1e293b", borderRadius: "16px", padding: "28px", width: "min(520px, 95vw)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid #334155" };
const modalTitle   = { margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#f8fafc", borderBottom: "1px solid #334155", paddingBottom: "12px" };
const labelSt      = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#cbd5e1" };
const inputSt      = { width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #475569", fontSize: "14px", boxSizing: "border-box", background: "#0f172a", color: "#f8fafc", outline: "none" };
const btnPrimary   = { padding: "11px 22px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" };
const btnSecondary = { padding: "11px 18px", background: "#334155", color: "#cbd5e1", border: "1px solid #475569", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600" };

const btnSecondaryText = { padding: "8px 14px", background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" };
const btnDangerText    = { padding: "8px 14px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" };

const navBtn       = (active) => ({ padding: "8px 16px", background: active ? "#0f172a" : "transparent", color: active ? "#38bdf8" : "#94a3b8", border: active ? "1px solid #334155" : "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", transition: "all 0.2s" });