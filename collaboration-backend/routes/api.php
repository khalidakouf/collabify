<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// 🟢 Routes publiques
Route::post('/login', [AuthController::class, 'login']);

// 🔴 Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // 👤 Compte & Utilisateurs
    Route::post('/logout',       [AuthController::class, 'logout']);
    Route::get('/me',            [AuthController::class, 'me']);
    Route::get('/users',         [UserController::class, 'index']);

    // 📂 Projets — lecture accessible à tous les rôles
    Route::get('/projects',      [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);

    // 📄 Fichiers d'un projet — lecture accessible à tous
    Route::get('/projects/{id}/files', [FileController::class, 'index']);

    // 📝 Tâches — lecture et changement de statut accessibles à tous
    Route::get('/tasks',                     [TaskController::class, 'index']);
    Route::put('/tasks/{id}/status',         [TaskController::class, 'updateStatus']);

    // 💬 Commentaires — lecture accessible à tous
    Route::get('/tasks/{id}/comments',  [CommentController::class, 'index']);
    Route::post('/comments',            [CommentController::class, 'store']);

    // 🔔 Notifications
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read',    [NotificationController::class, 'markAsRead']);

    // 🔒 Admin + Chef de Projet uniquement
    Route::middleware('role:admin,chef_projet')->group(function () {
        // Gestion des projets
        Route::post('/projects',        [ProjectController::class, 'store']);
        Route::put('/projects/{id}',    [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

        // Gestion des tâches
        Route::post('/tasks',        [TaskController::class, 'store']);
        Route::put('/tasks/{id}',    [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

        // Upload de fichiers
        Route::post('/files/upload', [FileController::class, 'store']);
    });

    // 👑 Admin uniquement — gestion des utilisateurs
    Route::middleware('role:admin')->group(function () {
        Route::post('/users',        [UserController::class, 'store']);
        Route::put('/users/{id}',    [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // 🔢 Sous-tâches
    Route::put('/subtasks/{id}/toggle', [SubtaskController::class, 'toggleStatus']);
});