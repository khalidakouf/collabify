import { useState, useEffect, useCallback } from "react";

// ================================================================
// 📌 CONFIGURATION & CONSTANTES GLOBALES
// ================================================================

/** URL de base de l'API Laravel */
const API_BASE = "http://127.0.0.1:8000/api";

/**
 * Génère les en-têtes HTTP pour les requêtes protégées.
 * Le token Bearer est récupéré depuis le localStorage après connexion.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Configuration des priorités des tâches.
 * Centralisé ici pour être réutilisé dans tout le Dashboard.
 */
const PRIORITY = {
  haute:   { label: "🔴 Urgente", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  moyenne: { label: "🟡 Moyenne", color: "#eab308", bg: "rgba(234,179,8,0.12)"  },
  basse:   { label: "🟢 Basse",   color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
};

/**
 * Configuration des 3 colonnes du tableau Kanban.
 * Chaque colonne a ses propres couleurs et icône.
 */
const KANBAN_COLUMNS = [
  {
    key: "a_faire",
    label: "À Faire",
    icon: "📋",
    dot: "#6366f1",
    border: "rgba(99,102,241,0.25)",
    glow: "rgba(99,102,241,0.07)",
    accent: "#818cf8",
  },
  {
    key: "en_cours",
    label: "En Cours",
    icon: "⚡",
    dot: "#a855f7",
    border: "rgba(168,85,247,0.25)",
    glow: "rgba(168,85,247,0.07)",
    accent: "#c084fc",
  },
  {
    key: "termine",
    label: "Terminé",
    icon: "✅",
    dot: "#22c55e",
    border: "rgba(34,197,94,0.25)",
    glow: "rgba(34,197,94,0.07)",
    accent: "#4ade80",
  },
];

// ================================================================
// 🪝 HOOK PERSONNALISÉ — Détection écran mobile
// ================================================================

/**
 * Hook qui retourne `true` si la largeur de la fenêtre est < 768px.
 * Utilisé pour adapter la mise en page (responsive design).
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return isMobile;
}

// ================================================================
// 📊 COMPOSANT — TABLEAU KANBAN
// ================================================================

/**
 * Affiche les 3 colonnes Kanban avec les tâches filtrées par statut.
 *
 * Props:
 * - tasks         : tableau des tâches du projet sélectionné
 * - onStatusChange: callback pour changer le statut d'une tâche
 * - onEditTask    : callback pour ouvrir le modal de modification
 * - onDeleteTask  : callback pour supprimer une tâche
 * - userRole      : rôle de l'utilisateur connecté
 */
function KanbanBoard({ tasks, onStatusChange, onEditTask, onDeleteTask, userRole }) {
  // Seuls l'admin et le chef de projet peuvent modifier/supprimer les tâches
  const canManage = userRole === "admin" || userRole === "chef_projet";

  /**
   * Retourne le nom de l'assigné en supportant les deux formats de l'API:
   * - task.assignee.name  (format Eloquent avec relation chargée)
   * - task.assignee_name  (format computed accessor)
   */
  const getAssigneeName = (task) =>
    task.assignee?.name || task.assignee_name || null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "repeat(3, 1fr)",
      gap: "20px",
      marginTop: "12px",
    }}>
      {KANBAN_COLUMNS.map((col) => {
        // Filtrer les tâches de cette colonne selon leur statut
        const colTasks = tasks.filter((t) => t.status === col.key);

        return (
          <div key={col.key} style={{
            background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
            border: `1px solid ${col.border}`,
            borderRadius: "16px",
            padding: "18px",
            minHeight: "520px",
            display: "flex",
            flexDirection: "column",
            boxShadow: `0 0 24px ${col.glow}`,
          }}>

            {/* ── En-tête de la colonne ─────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ fontSize: "18px" }}>{col.icon}</span>
              <span style={{ fontWeight: "800", fontSize: "15px", color: "#f8fafc", flex: 1 }}>
                {col.label}
              </span>
              <span style={{
                background: col.border, color: col.accent,
                fontSize: "12px", fontWeight: "700",
                padding: "3px 10px", borderRadius: "20px",
                minWidth: "28px", textAlign: "center",
              }}>
                {colTasks.length}
              </span>
            </div>

            {/* Ligne de séparation colorée (accent visuel) */}
            <div style={{
              height: "2px",
              background: `linear-gradient(90deg, ${col.dot}, transparent)`,
              borderRadius: "2px",
              marginBottom: "16px",
            }} />

            {/* ── Liste des tâches ──────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>

              {/* Message si aucune tâche dans cette colonne */}
              {colTasks.length === 0 && (
                <div style={{
                  textAlign: "center", color: "#334155",
                  fontSize: "13px", padding: "48px 10px",
                  border: "1px dashed #1e293b", borderRadius: "12px",
                }}>
                  Aucune tâche ici
                </div>
              )}

              {/* Carte de chaque tâche */}
              {colTasks.map((task) => {
                const prio = PRIORITY[task.priority] || PRIORITY.basse;
                const assigneeName = getAssigneeName(task);

                return (
                  <div
                    key={task.id}
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "14px",
                      padding: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                      transition: "border-color 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = col.dot + "90";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#334155";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Titre + badge priorité */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "#f8fafc", lineHeight: "1.45", flex: 1 }}>
                        {task.title}
                      </strong>
                      <span style={{
                        fontSize: "10px", fontWeight: "700",
                        background: prio.bg, color: prio.color,
                        padding: "3px 8px", borderRadius: "6px",
                        border: `1px solid ${prio.color}33`,
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {prio.label}
                      </span>
                    </div>

                    {/* Description (tronquée à 2 lignes) */}
                    {task.description && (
                      <p style={{
                        fontSize: "12px", color: "#64748b",
                        margin: "0 0 10px", lineHeight: "1.6",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {task.description}
                      </p>
                    )}

                    {/* Assigné à */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      {assigneeName ? (
                        <>
                          <div style={{
                            width: "24px", height: "24px", borderRadius: "50%",
                            background: "linear-gradient(135deg,#6366f1,#a855f7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "9px", fontWeight: "700", flexShrink: 0,
                          }} title={assigneeName}>
                            {assigneeName.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{assigneeName}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#334155" }}>👤 Non assigné</span>
                      )}
                    </div>

                    {/* Zone d'actions: changer statut + modifier/supprimer */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      borderTop: "1px solid #334155", paddingTop: "10px",
                    }}>
                      {/* Select pour changer le statut (accessible à tous les rôles) */}
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                        style={{
                          flex: 1, padding: "6px 8px", fontSize: "11px",
                          border: "1px solid #334155", borderRadius: "8px",
                          background: "#0f172a", cursor: "pointer",
                          color: "#cbd5e1", outline: "none", fontFamily: "inherit",
                        }}
                      >
                        <option value="a_faire">📋 À Faire</option>
                        <option value="en_cours">⚡ En Cours</option>
                        <option value="termine">✅ Terminé</option>
                      </select>

                      {/* Boutons modifier et supprimer (admin / chef uniquement) */}
                      {canManage && (
                        <>
                          <button
                            onClick={() => onEditTask(task)}
                            title="Modifier la tâche"
                            style={ST.btnIconBlue}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Supprimer la tâche"
                            style={ST.btnIconRed}
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// 📝 SOUS-COMPOSANT — FORMULAIRE ÉTAPE 1 (Infos projet)
// ================================================================

/**
 * Première étape du formulaire de création de projet.
 * Collecte: titre, description, deadline, et nombre de tâches.
 * @param {Function} onNext - Callback appelé avec les données quand on valide
 */
function Step1Form({ onNext }) {
  const [form, setForm] = useState({
    title: "", description: "", deadline: "", nbTasks: 3,
  });

  // Fonction helper pour mettre à jour un champ du formulaire
  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={ST.modalBox}>
      <h3 style={ST.modalTitle}>📁 Nouveau Projet — Étape 1 / 2</h3>
      <p style={{ color: "#64748b", fontSize: "13px", margin: "-12px 0 18px" }}>
        Renseignez les informations générales du projet
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext({ ...form, nbTasks: parseInt(form.nbTasks) });
        }}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div>
          <label style={ST.label}>Titre du projet *</label>
          <input
            style={ST.input}
            value={form.title}
            onChange={set("title")}
            required
            placeholder="Ex: Refonte Site Web"
          />
        </div>

        <div>
          <label style={ST.label}>Description</label>
          <textarea
            style={{ ...ST.input, minHeight: "72px", resize: "vertical" }}
            value={form.description}
            onChange={set("description")}
            placeholder="Objectif et contexte du projet..."
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={ST.label}>Deadline</label>
            <input style={ST.input} type="date" value={form.deadline} onChange={set("deadline")} />
          </div>
          <div>
            <label style={ST.label}>Nombre de tâches *</label>
            <input
              style={ST.input}
              type="number" min="1" max="20"
              value={form.nbTasks}
              onChange={set("nbTasks")}
              required
            />
          </div>
        </div>

        <button type="submit" style={{ ...ST.btnPrimary, marginTop: "6px" }}>
          Suivant →
        </button>
      </form>
    </div>
  );
}

// ================================================================
// 📝 SOUS-COMPOSANT — FORMULAIRE ÉTAPE 2 (Définir les tâches)
// ================================================================

/**
 * Deuxième étape: configuration de chaque tâche du projet.
 * @param {Object}   projectData - Données saisies à l'étape 1
 * @param {Array}    users       - Liste des utilisateurs (pour assigner)
 * @param {Function} onCreate    - Callback de création finale
 * @param {Function} onBack      - Callback de retour à l'étape 1
 * @param {boolean}  loading     - Indique si la requête est en cours
 */
function Step2Form({ projectData, users, onCreate, onBack, loading }) {
  // Initialiser le tableau de tâches selon le nombre choisi à l'étape 1
  const [tasks, setTasks] = useState(
    Array.from({ length: projectData.nbTasks }, () => ({
      title: "", description: "", priority: "moyenne", assigned_to: "",
    }))
  );

  // Met à jour un champ d'une tâche spécifique par son index
  const updateTask = (index, field, value) =>
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );

  // Filtrer les utilisateurs assignables (employés et stagiaires uniquement)
  const assignables = users.filter(
    (u) => u.role === "employe" || u.role === "stagiaire"
  );

  return (
    <div style={{ ...ST.modalBox, maxWidth: "660px", maxHeight: "82vh", overflowY: "auto" }}>
      <h3 style={ST.modalTitle}>📝 Configurer les Tâches — Étape 2 / 2</h3>
      <p style={{ color: "#64748b", fontSize: "13px", margin: "-12px 0 18px" }}>
        Projet : <strong style={{ color: "#f8fafc" }}>{projectData.title}</strong>
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); onCreate(tasks); }}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        {tasks.map((task, i) => (
          <div key={i} style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8", marginBottom: "10px" }}>
              📌 Tâche {i + 1}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                style={ST.input}
                value={task.title}
                onChange={(e) => updateTask(i, "title", e.target.value)}
                required
                placeholder="Titre de la tâche *"
              />
              <input
                style={ST.input}
                value={task.description}
                onChange={(e) => updateTask(i, "description", e.target.value)}
                placeholder="Description (optionnel)"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={ST.label}>Priorité</label>
                  <select style={ST.input} value={task.priority} onChange={(e) => updateTask(i, "priority", e.target.value)}>
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">🟢 Basse</option>
                  </select>
                </div>
                <div>
                  <label style={ST.label}>Assigné à</label>
                  <select style={ST.input} value={task.assigned_to} onChange={(e) => updateTask(i, "assigned_to", e.target.value)}>
                    <option value="">-- Non assigné --</option>
                    {assignables.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === "employe" ? "Employé" : "Stagiaire"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button type="button" onClick={onBack} style={ST.btnSecondary}>
            ← Retour
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...ST.btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "⏳ Création en cours..." : "✅ Créer le Projet"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ================================================================
// 🏠 COMPOSANT PRINCIPAL — DASHBOARD
// ================================================================

/**
 * Composant principal du Dashboard de l'application Collabify.
 *
 * Gère:
 * - La liste des projets (vue grille)
 * - Le tableau Kanban (vue tâches par projet)
 * - La création / modification / suppression de projets
 * - La création / modification / suppression de tâches
 * - La synchronisation en temps réel via API
 */
export default function Dashboard() {

  // ── Informations de l'utilisateur connecté ─────────────────────
  const userName = localStorage.getItem("user_name") || "Utilisateur";
  const userRole = localStorage.getItem("role") || "";
  const userId   = localStorage.getItem("user_id");
  const isMobile = useIsMobile();

  // ── État global: données chargées depuis l'API ──────────────────
  const [projects,        setProjects]        = useState([]);
  const [users,           setUsers]           = useState([]);
  const [notifications,   setNotifications]   = useState([]);
  const [tasks,           setTasks]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [successMsg,      setSuccessMsg]      = useState("");

  // ── État: workflow de création de projet (2 étapes) ────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep,      setCreateStep]      = useState(1);
  const [projectData,     setProjectData]     = useState(null);
  const [creating,        setCreating]        = useState(false);

  // ── État: modal de modification de projet ─────────────────────
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editProj, setEditProj] = useState({
    title: "", description: "", deadline: "", status: "en_cours",
  });
  const [deleting, setDeleting] = useState(false);

  // ── État: modal de modification de tâche ──────────────────────
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask,       setEditingTask]       = useState(null);
  const [editTask, setEditTask] = useState({
    title: "", description: "", priority: "moyenne", assigned_to: "", status: "a_faire",
  });
  const [savingTask, setSavingTask] = useState(false);

  // ── État: modal d'ajout rapide d'une tâche ─────────────────────
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "moyenne", assigned_to: "",
  });
  const [addingTask, setAddingTask] = useState(false);

  // ==============================================================
  // 🌐 FONCTIONS DE FETCH — Communication avec l'API Laravel
  // ==============================================================

  /**
   * Récupère la liste des projets.
   * Le backend filtre automatiquement selon le rôle (Admin/Chef/Employé/Stagiaire).
   * useCallback évite de recréer la fonction à chaque rendu.
   */
  const fetchProjects = useCallback(() => {
    fetch(`${API_BASE}/projects`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  /**
   * Récupère les tâches d'un projet via un appel API direct.
   * IMPORTANT: On utilise cette fonction (et non setTasks(data.tasks))
   * pour garantir la synchronisation en temps réel, même pour les
   * employés et stagiaires qui n'ont pas créé le projet.
   *
   * @param {number} projectId - ID du projet
   */
  const fetchTasksOfProject = useCallback((projectId) => {
    fetch(`${API_BASE}/tasks?project_id=${projectId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  /**
   * Chargement initial: récupère projets, utilisateurs et notifications
   * en parallèle avec Promise.all pour optimiser les performances.
   */
  useEffect(() => {
    // Appliquer le fond sombre sur tout le document
    document.body.style.background = "#0f172a";
    document.body.style.margin     = "0";
    document.body.style.padding    = "0";

    Promise.all([
      fetch(`${API_BASE}/projects`,      { headers: authHeaders() }).then((r) => r.json()),
      fetch(`${API_BASE}/users`,         { headers: authHeaders() }).then((r) => r.json()),
      fetch(`${API_BASE}/notifications`, { headers: authHeaders() }).then((r) => r.json()),
    ])
      .then(([proj, usr, notif]) => {
        setProjects(Array.isArray(proj)  ? proj  : []);
        setUsers(Array.isArray(usr)      ? usr   : []);
        setNotifications(Array.isArray(notif) ? notif : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /**
   * Recharger les tâches automatiquement quand le projet sélectionné change.
   * Cette dépendance [selectedProject] garantit la fraîcheur des données.
   */
  useEffect(() => {
    if (!selectedProject) return;
    fetchTasksOfProject(selectedProject.id);
  }, [selectedProject, fetchTasksOfProject]);

  // ==============================================================
  // ⚡ HANDLERS — Gestion des actions utilisateur
  // ==============================================================

  /** Affiche un message de succès temporaire (3.5 secondes) */
  const showFlash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  /** Déconnecte l'utilisateur et redirige vers la page de login */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /**
   * Change le statut d'une tâche (équivalent du glisser-déposer Kanban).
   *
   * Stratégie "Optimistic Update":
   * 1. Met à jour le state local IMMÉDIATEMENT → feedback visuel instantané
   * 2. Envoie la requête API en arrière-plan
   * 3. Si erreur: recharge depuis le serveur pour corriger l'état
   */
  const handleStatusChange = async (taskId, newStatus) => {
    // Mise à jour optimiste (temps réel visuel)
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // En cas d'erreur serveur: resynchroniser depuis l'API
      fetchTasksOfProject(selectedProject.id);
    }
  };

  /**
   * Crée un nouveau projet avec toutes ses tâches en une seule transaction.
   * Après création: rafraîchissement forcé via fetchTasksOfProject
   * pour garantir l'affichage immédiat chez l'employé/stagiaire assigné.
   */
  const handleCreate = async (tasksList) => {
    setCreating(true);
    try {
      const res  = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title:       projectData.title,
          description: projectData.description,
          deadline:    projectData.deadline || null,
          // Filtrer les tâches sans titre (saisies laissées vides)
          tasks: tasksList.filter((t) => t.title?.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création");

      // Étape 1: Mettre à jour la liste des projets
      fetchProjects();

      // Étape 2: Naviguer automatiquement vers le nouveau projet
      setSelectedProject(data.project);

      // Étape 3: Fix bug sync — appel API direct (PAS setTasks(data.tasks))
      // Cela garantit que les tâches sont visibles immédiatement pour tous les rôles
      fetchTasksOfProject(data.project.id);

      // Fermer le modal et réinitialiser le workflow
      setShowCreateModal(false);
      setCreateStep(1);
      setProjectData(null);
      showFlash("✅ Projet créé et initialisé avec succès !");

    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setCreating(false);
    }
  };

  /** Prépare et ouvre le modal de modification du projet sélectionné */
  const openEditProject = () => {
    if (!selectedProject) return;
    setEditProj({
      title:       selectedProject.title,
      description: selectedProject.description || "",
      deadline:    selectedProject.deadline    || "",
      status:      selectedProject.status      || "en_cours",
    });
    setShowEditProjectModal(true);
  };

  /** Envoie les modifications du projet à l'API */
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`${API_BASE}/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...editProj, deadline: editProj.deadline || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setSelectedProject(data.project);
      fetchProjects();
      setShowEditProjectModal(false);
      showFlash("✅ Projet modifié avec succès !");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  /** Supprime le projet sélectionné après confirmation utilisateur */
  const handleDeleteProject = async () => {
    if (!window.confirm(
      `Supprimer définitivement le projet "${selectedProject?.title}" et toutes ses tâches ?`
    )) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${selectedProject.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur de suppression");

      setSelectedProject(null);
      setTasks([]);
      fetchProjects();
      showFlash("🗑 Projet supprimé.");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  /** Ouvre le modal de modification d'une tâche avec ses données pré-remplies */
  const openEditTask = (task) => {
    setEditingTask(task);
    setEditTask({
      title:       task.title,
      description: task.description || "",
      priority:    task.priority    || "moyenne",
      status:      task.status      || "a_faire",
      // Récupérer l'ID assigné depuis les deux formats possibles de l'API
      assigned_to: task.assigned_to
        ? String(task.assigned_to)
        : task.assignee?.id
          ? String(task.assignee.id)
          : "",
    });
    setShowEditTaskModal(true);
  };

  /** Envoie les modifications d'une tâche à l'API */
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setSavingTask(true);
    try {
      const res  = await fetch(`${API_BASE}/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...editTask, assigned_to: editTask.assigned_to || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      // Rafraîchir les tâches du projet courant
      fetchTasksOfProject(selectedProject.id);
      setShowEditTaskModal(false);
      setEditingTask(null);
      showFlash("✅ Tâche mise à jour !");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSavingTask(false);
    }
  };

  /**
   * Supprime une tâche du Kanban.
   * Utilise une suppression optimiste pour un retour visuel immédiat.
   */
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Supprimer cette tâche définitivement ?")) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur");
      // Suppression optimiste: retirer la tâche du state sans recharger
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showFlash("🗑 Tâche supprimée.");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  /** Ajoute une nouvelle tâche au projet en cours */
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setAddingTask(true);
    try {
      const res  = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          project_id:  selectedProject.id,
          status:      "a_faire",
          ...newTask,
          assigned_to: newTask.assigned_to || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      // Rafraîchir la liste complète des tâches
      fetchTasksOfProject(selectedProject.id);
      setShowAddTaskModal(false);
      setNewTask({ title: "", description: "", priority: "moyenne", assigned_to: "" });
      showFlash("✅ Tâche ajoutée avec succès !");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setAddingTask(false);
    }
  };

  // ==============================================================
  // 📊 DONNÉES CALCULÉES (statistiques pour l'affichage)
  // ==============================================================

  const unread     = notifications.filter((n) => !n.is_read).length;
  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter((t) => t.status === "termine").length;
  const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Un utilisateur peut gérer un projet s'il est Admin OU Chef mola l'projet
  const canManageProject =
    userRole === "admin" || selectedProject?.chef_id == userId;

  // Utilisateurs assignables (employés et stagiaires)
  const assignables = users.filter(
    (u) => u.role === "employe" || u.role === "stagiaire"
  );

  // Statuts des projets avec leurs styles
  const PROJECT_STATUS = {
    en_cours: { label: "🔄 En cours", color: "#38bdf8", bg: "rgba(56,189,248,0.1)"  },
    termine:  { label: "✅ Terminé",  color: "#4ade80", bg: "rgba(34,197,94,0.1)"   },
    annule:   { label: "❌ Annulé",   color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
  };

  // ==============================================================
  // 🎨 RENDU JSX
  // ==============================================================

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      minHeight: "100vh",
      background: "#0f172a",
      color: "#f8fafc",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
      overflowX: "hidden",
    }}>

      {/* ============================================================
          🔝 BARRE DE NAVIGATION (NAVBAR)
          Sticky en haut, effet glassmorphism avec backdrop-filter.
          Contenu: Logo | Dashboard | Admin (si admin) | Notifs | Profil
          ============================================================ */}
      <nav style={{
        width: "100%",
        height: "64px",
        background: "rgba(30,41,59,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #334155",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      }}>

        {/* Logo — clic pour revenir à la grille de projets */}
        <span
          onClick={() => { setSelectedProject(null); setTasks([]); }}
          style={{ color: "#38bdf8", fontWeight: "800", fontSize: "22px", letterSpacing: "-0.5px", cursor: "pointer", marginRight: "20px" }}
        >
          Collabify
        </span>

        {/* Bouton Dashboard */}
        <button
          onClick={() => { setSelectedProject(null); setTasks([]); }}
          style={navBtnStyle(!selectedProject)}
        >
          🏠 Dashboard
        </button>

        {/* Bouton Admin (visible uniquement pour le rôle admin) */}
        {userRole === "admin" && (
          <button
            onClick={() => (window.location.href = "/admin")}
            style={{ ...navBtnStyle(false), color: "#fbbf24", marginLeft: "4px" }}
          >
            👑 Admin
          </button>
        )}

        {/* Spacer flexible */}
        <div style={{ flex: 1 }} />

        {/* Badge notifications non lues */}
        {unread > 0 && (
          <span style={{
            background: "#ef4444", color: "#fff",
            fontSize: "11px", fontWeight: "700",
            padding: "3px 10px", borderRadius: "20px",
            marginRight: "14px",
          }}>
            🔔 {unread}
          </span>
        )}

        {/* Bouton Nouveau Projet (Admin et Chef uniquement) */}
        {(userRole === "chef_projet" || userRole === "admin") && (
          <button
            onClick={() => { setShowCreateModal(true); setCreateStep(1); }}
            style={{ ...ST.btnPrimary, marginRight: "16px", fontSize: "13px", padding: "9px 18px" }}
          >
            + Nouveau Projet
          </button>
        )}

        {/* Profil utilisateur connecté */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderLeft: "1px solid #334155", paddingLeft: "16px" }}>
          {/* Avatar avec initiale */}
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "14px", fontWeight: "700",
            boxShadow: "0 0 10px rgba(99,102,241,0.4)",
            flexShrink: 0,
          }}>
            {userName?.[0]?.toUpperCase()}
          </div>
          {/* Nom et rôle (masqués sur mobile) */}
          {!isMobile && (
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "600" }}>{userName}</div>
              <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
                {userRole?.replace("_", " ")}
              </div>
            </div>
          )}
          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            title="Déconnexion"
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", marginLeft: "4px", padding: "4px" }}
          >
            ⏏
          </button>
        </div>
      </nav>

      {/* ============================================================
          📄 CONTENU PRINCIPAL
          ============================================================ */}
      <main style={{
        flex: 1,
        padding: isMobile ? "20px 16px" : "32px 40px",
        boxSizing: "border-box",
      }}>

        {/* Message flash de succès (apparaît temporairement) */}
        {successMsg && (
          <div style={{
            background: "rgba(34,197,94,0.12)", color: "#4ade80",
            border: "1px solid rgba(34,197,94,0.25)",
            padding: "14px 20px", borderRadius: "12px",
            marginBottom: "24px", fontSize: "14px", fontWeight: "600",
          }}>
            {successMsg}
          </div>
        )}

        {/* ── 1. ÉCRAN DE CHARGEMENT ────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p style={{ margin: 0, fontSize: "15px" }}>Chargement de votre espace de travail...</p>
          </div>

        /* ── 2. VUE KANBAN (quand un projet est sélectionné) ─────── */
        ) : selectedProject ? (
          <div>

            {/* En-tête du projet avec stats et barre de progression */}
            <div style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "24px 28px",
              marginBottom: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>

                {/* Titre et description */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "24px", color: "#f8fafc", fontWeight: "800" }}>
                    {selectedProject.title}
                  </h2>
                  {selectedProject.description && (
                    <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>
                      {selectedProject.description}
                    </p>
                  )}
                </div>

                {/* Boutons d'action (Modifier, Supprimer, Retour) */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
                  {canManageProject && (
                    <>
                      <button onClick={openEditProject} style={ST.btnEdit}>
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        disabled={deleting}
                        style={{ ...ST.btnDanger, opacity: deleting ? 0.6 : 1 }}
                      >
                        {deleting ? "..." : "🗑 Supprimer"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setSelectedProject(null); setTasks([]); }}
                    style={ST.btnSecondary}
                  >
                    ← Retour
                  </button>
                </div>
              </div>

              {/* Statistiques et barre de progression */}
              <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "12px" }}>

                  {/* Compteurs par statut */}
                  <div style={{ display: "flex", gap: "20px" }}>
                    {[
                      { label: "Total",    val: totalTasks,                                        color: "#94a3b8" },
                      { label: "À faire",  val: tasks.filter(t => t.status === "a_faire").length,  color: "#818cf8" },
                      { label: "En cours", val: tasks.filter(t => t.status === "en_cours").length, color: "#c084fc" },
                      { label: "Terminé",  val: doneTasks,                                         color: "#4ade80" },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bouton ajouter une tâche (admin / chef seulement) */}
                  {(userRole === "admin" || userRole === "chef_projet") && (
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      style={{ ...ST.btnPrimary, background: "linear-gradient(135deg,#a855f7,#ec4899)" }}
                    >
                      + Nouvelle Tâche
                    </button>
                  )}
                </div>

                {/* Barre de progression colorée */}
                <div style={{ background: "#0f172a", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg,#6366f1,#a855f7,#22c55e)",
                    borderRadius: "8px",
                    transition: "width 0.6s ease",
                    boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                  }} />
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 0" }}>
                  Progression : <strong style={{ color: "#f8fafc" }}>{progress}%</strong>
                  {" "}— {doneTasks}/{totalTasks} tâches terminées
                </p>
              </div>
            </div>

            {/* Tableau Kanban */}
            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEditTask={openEditTask}
              onDeleteTask={handleDeleteTask}
              userRole={userRole}
            />
          </div>

        /* ── 3. VUE GRILLE DES PROJETS (page d'accueil) ─────────── */
        ) : (
          <div>
            {/* Titre de la section */}
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "800", color: "#f8fafc" }}>
                Mes Projets
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                {projects.length} projet{projects.length > 1 ? "s" : ""} assigné{projects.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Grille ou message "aucun projet" */}
            {projects.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "80px 20px",
                background: "#1e293b", borderRadius: "20px",
                border: "1px solid #334155", color: "#64748b",
              }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>📂</div>
                <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "600", color: "#94a3b8" }}>
                  Aucun projet assigné
                </p>
                {(userRole === "admin" || userRole === "chef_projet") && (
                  <p style={{ margin: 0, fontSize: "13px" }}>
                    Cliquez sur{" "}
                    <strong style={{ color: "#6366f1" }}>+ Nouveau Projet</strong>{" "}
                    pour commencer
                  </p>
                )}
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}>
                {projects.map((project) => {
                  const statusConf =
                    PROJECT_STATUS[project.status] ||
                    { label: project.status, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };

                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "20px",
                        padding: "24px",
                        cursor: "pointer",
                        transition: "all 0.22s ease",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#6366f1";
                        e.currentTarget.style.transform   = "translateY(-5px)";
                        e.currentTarget.style.boxShadow   = "0 16px 40px rgba(99,102,241,0.18)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#334155";
                        e.currentTarget.style.transform   = "translateY(0)";
                        e.currentTarget.style.boxShadow   = "0 4px 12px rgba(0,0,0,0.2)";
                      }}
                    >
                      {/* Ligne décorative en haut (gradient) */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                        background: "linear-gradient(90deg,#6366f1,#a855f7)",
                      }} />

                      {/* Titre + badge statut */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "17px", color: "#f8fafc", fontWeight: "700", lineHeight: 1.3 }}>
                          {project.title}
                        </h3>
                        <span style={{
                          fontSize: "11px", padding: "4px 10px",
                          borderRadius: "20px",
                          background: statusConf.bg, color: statusConf.color,
                          fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                          {statusConf.label}
                        </span>
                      </div>

                      {/* Description (tronquée à 2 lignes) */}
                      <p style={{
                        margin: "0 0 20px", fontSize: "13px", color: "#64748b",
                        lineHeight: 1.6, height: "40px", overflow: "hidden",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {project.description || "Aucune description fournie."}
                      </p>

                      {/* Pied de carte: deadline + lien */}
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderTop: "1px solid #334155", paddingTop: "14px",
                      }}>
                        <div style={{ fontSize: "12px", color: "#475569" }}>
                          {project.deadline ? `📅 ${project.deadline}` : "⏳ Pas de deadline"}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6366f1", fontWeight: "700" }}>
                          Voir le board →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================
          🪟 MODALS (fenêtres de dialogue)
          Chaque modal utilise le même overlay avec backdropFilter.
          ============================================================ */}

      {/* Modal: Créer un projet (étapes 1 et 2) */}
      {showCreateModal && (
        <div style={ST.overlay}>
          {createStep === 1 && (
            <Step1Form
              onNext={(d) => { setProjectData(d); setCreateStep(2); }}
            />
          )}
          {createStep === 2 && (
            <Step2Form
              projectData={projectData}
              users={users}
              onCreate={handleCreate}
              onBack={() => setCreateStep(1)}
              loading={creating}
            />
          )}
        </div>
      )}

      {/* Modal: Modifier un projet */}
      {showEditProjectModal && (
        <div style={ST.overlay}>
          <div style={ST.modalBox}>
            <h3 style={ST.modalTitle}>✏️ Modifier le Projet</h3>
            <form onSubmit={handleUpdateProject} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={ST.label}>Titre *</label>
                <input style={ST.input} required value={editProj.title} onChange={(e) => setEditProj((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={ST.label}>Description</label>
                <textarea style={{ ...ST.input, minHeight: "80px", resize: "vertical" }} value={editProj.description} onChange={(e) => setEditProj((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={ST.label}>Date limite</label>
                <input style={ST.input} type="date" value={editProj.deadline} onChange={(e) => setEditProj((f) => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div>
                <label style={ST.label}>Statut</label>
                <select style={ST.input} value={editProj.status} onChange={(e) => setEditProj((f) => ({ ...f, status: e.target.value }))}>
                  <option value="en_cours">🔄 En Cours</option>
                  <option value="termine">✅ Terminé</option>
                  <option value="annule">❌ Annulé</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowEditProjectModal(false)} style={ST.btnSecondary}>
                  Annuler
                </button>
                <button type="submit" style={{ ...ST.btnPrimary, flex: 1 }}>
                  💾 Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier une tâche */}
      {showEditTaskModal && editingTask && (
        <div style={ST.overlay}>
          <div style={ST.modalBox}>
            <h3 style={ST.modalTitle}>✏️ Modifier la Tâche</h3>
            <form onSubmit={handleUpdateTask} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={ST.label}>Titre *</label>
                <input style={ST.input} required value={editTask.title} onChange={(e) => setEditTask((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={ST.label}>Description</label>
                <textarea style={{ ...ST.input, minHeight: "70px", resize: "vertical" }} value={editTask.description} onChange={(e) => setEditTask((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={ST.label}>Priorité</label>
                  <select style={ST.input} value={editTask.priority} onChange={(e) => setEditTask((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">🟢 Basse</option>
                  </select>
                </div>
                <div>
                  <label style={ST.label}>Statut</label>
                  <select style={ST.input} value={editTask.status} onChange={(e) => setEditTask((f) => ({ ...f, status: e.target.value }))}>
                    <option value="a_faire">📋 À Faire</option>
                    <option value="en_cours">⚡ En Cours</option>
                    <option value="termine">✅ Terminé</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={ST.label}>Assigner à</label>
                <select style={ST.input} value={editTask.assigned_to} onChange={(e) => setEditTask((f) => ({ ...f, assigned_to: e.target.value }))}>
                  <option value="">-- Non assigné --</option>
                  {assignables.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name} ({u.role === "employe" ? "Employé" : "Stagiaire"})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => { setShowEditTaskModal(false); setEditingTask(null); }} style={ST.btnSecondary}>
                  Annuler
                </button>
                <button type="submit" disabled={savingTask} style={{ ...ST.btnPrimary, flex: 1, opacity: savingTask ? 0.7 : 1 }}>
                  {savingTask ? "Sauvegarde..." : "💾 Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajouter une tâche rapide */}
      {showAddTaskModal && (
        <div style={ST.overlay}>
          <div style={ST.modalBox}>
            <h3 style={ST.modalTitle}>➕ Ajouter une Tâche</h3>
            <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={ST.label}>Titre *</label>
                <input
                  style={ST.input} required
                  placeholder="Titre de la tâche..."
                  value={newTask.title}
                  onChange={(e) => setNewTask((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label style={ST.label}>Description</label>
                <textarea
                  style={{ ...ST.input, minHeight: "70px", resize: "vertical" }}
                  placeholder="Détails de la tâche..."
                  value={newTask.description}
                  onChange={(e) => setNewTask((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={ST.label}>Priorité</label>
                  <select style={ST.input} value={newTask.priority} onChange={(e) => setNewTask((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">🟢 Basse</option>
                  </select>
                </div>
                <div>
                  <label style={ST.label}>Assigné à</label>
                  <select style={ST.input} value={newTask.assigned_to} onChange={(e) => setNewTask((f) => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">-- Non assigné --</option>
                    {assignables.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} style={ST.btnSecondary}>
                  Annuler
                </button>
                <button type="submit" disabled={addingTask} style={{
                  ...ST.btnPrimary, flex: 1,
                  background: "linear-gradient(135deg,#a855f7,#ec4899)",
                  opacity: addingTask ? 0.7 : 1,
                }}>
                  {addingTask ? "Ajout..." : "✅ Ajouter la tâche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ================================================================
// 🎨 DESIGN SYSTEM — Styles partagés
// ================================================================

/**
 * Génère le style d'un bouton de navigation.
 * @param {boolean} active - Si true, affiche le bouton comme "actif"
 */
const navBtnStyle = (active) => ({
  padding: "8px 16px",
  background: active ? "#0f172a" : "transparent",
  color:      active ? "#38bdf8" : "#94a3b8",
  border:     active ? "1px solid #334155" : "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "700",
  transition: "all 0.2s",
  fontFamily: "inherit",
});

/**
 * Objet de styles réutilisables (Design System interne).
 * Centralise tous les styles communs pour la cohérence visuelle.
 */
const ST = {
  // Overlay semi-transparent pour les modals
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },

  // Conteneur d'un modal
  modalBox: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "28px",
    width: "min(520px, 95vw)",
    boxShadow: "0 30px 60px -12px rgba(0,0,0,0.6)",
  },

  // Titre d'un modal avec séparateur
  modalTitle: {
    margin: "0 0 18px",
    fontSize: "18px", fontWeight: "800", color: "#f8fafc",
    borderBottom: "1px solid #334155", paddingBottom: "12px",
  },

  // Label de champ de formulaire
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px", fontWeight: "600", color: "#cbd5e1",
  },

  // Champ de saisie (input, textarea, select)
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #475569",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#0f172a",
    color: "#f8fafc",
    outline: "none",
    fontFamily: "inherit",
  },

  // Bouton principal (gradient indigo → violet)
  btnPrimary: {
    padding: "11px 22px",
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "700",
    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
    transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "inherit",
  },

  // Bouton secondaire (gris neutre)
  btnSecondary: {
    padding: "11px 18px",
    background: "#334155",
    color: "#cbd5e1",
    border: "1px solid #475569",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
    fontFamily: "inherit",
  },

  // Bouton de modification (bleu clair)
  btnEdit: {
    padding: "8px 14px",
    background: "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
    fontFamily: "inherit",
  },

  // Bouton de suppression (rouge)
  btnDanger: {
    padding: "8px 14px",
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
    fontFamily: "inherit",
  },

  // Bouton icône bleu (✏️ dans le Kanban)
  btnIconBlue: {
    padding: "6px 10px",
    fontSize: "12px",
    background: "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Bouton icône rouge (🗑 dans le Kanban)
  btnIconRed: {
    padding: "6px 10px",
    fontSize: "12px",
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};