 Collabify — Plateforme Intelligente de Gestion de Projets et de Collaboration

**Collabify** est une application web full-stack moderne conçue pour optimiser la gestion des projets, le suivi des tâches (via un Kanban Board dynamique) et la collaboration au sein des équipes. Ce projet a été développé dans le cadre du projet de synthèse pour l'obtention du diplôme au sein de la **Cité Métiers et des Compétences (CMC) Rabat-Salé-Kénitra**.

---

Fonctionnalités Clés
- **Tableau Kanban Interactif :** Gestion des tâches en temps réel (À faire , En cours , Terminé ).
- **Architecture Multi-Rôles :** Espaces dédiés pour l'Administrateur, Chef de projet, Employés et Stagiaires.
- **Gestion Avancée :** Création de projets par étapes guidées et assignation dynamique des tâches.
- **Interface Moderne :** Mode sombre unifié (`#0f172a`), épuré, fluide et entièrement responsive.
- **Sécurité :** Authentification sécurisée et protection des routes API via **Laravel Sanctum**.

---

## echnologies Utilisées

### Backend (API)
- **Framework :** Laravel 11 
- **Sécurité :** Laravel Sanctum 
- **Base de données :** MySQL 

### Frontend
- **Bibliothèque :** React.js 
- **Gestion du State :** React Hooks (`useState`, `useEffect`)
- **Design :** CSS personnalisé (Thème Full-Dark professionnel)

---

## Structure du Projet
Le dépôt est divisé en deux parties principales :
- `collaboration-backend/` : Contient l'API RESTful développée avec Laravel.
- `collaboration-frontend/` : Contient l'application interface utilisateur développée avec React.

---

  Installation et Configuration

1. Configuration du Backend (Laravel)
```bash
# Accéder au dossier backend
cd collaboration-backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans le fichier .env, puis lancer les migrations
php artisan migrate --seed

# Lancer le serveur d'API
php artisan serve

2. Configuration du Frontend (React)
Bash
# Accéder au dossier frontend
cd collaboration-frontend

# Installer les dépendances Node.js
npm install

# Lancer l'application en mode développement
npm start
Cadre du Projet
Établissement : Cité Métiers et des Compétences (CMC) — Rabat-Salé-Kénitra.

Filière : Développement Digital (Option Full-Stack).

Année : 2026.
