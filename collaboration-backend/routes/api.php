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

// 🟢 الـ Routes المفتوحين للعموم (Public Routes)
Route::post('/login', [AuthController::class, 'login']);


// 🔴 الـ Routes المحميين بـ Sanctum (لازم يكون المستخدم مسجل الدخول)
Route::middleware('auth:sanctum')->group(function () {
    
    // 👤 الحساب والمستخدمين
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/users', [UserController::class, 'index']); 

    // 📂 المشاريع (Projects) - العرض متاح لكل الأدوار حسب دالة الـ index
    Route::get('/projects', [ProjectController::class, 'index']); 
    Route::get('/projects/{id}', [ProjectController::class, 'show']);

    // 📝 المهام (Tasks) - جلب المهام محمي ومتاح لجميع الأدوار المسجلة
    Route::get('/tasks', [TaskController::class, 'index']);
    
    // تغيير حالة المهمة (Kanban Drag & Drop) متاح لجميع الموظفين والمتدربين
    Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus']);

    // 🔒 صلاحيات خاصة بـ (Admin و Chef de Projet) فقط
    Route::middleware('role:admin,chef_projet')->group(function () {
        // إدارة المشاريع
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']); // ✏️ هاد السطر اللي زِدنا دبا للتعديل
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

        // إدارة المهام بالكامل (إنشاء، تعديل، حذف)
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    });

    // 💬 التعليقات (Comments)
    Route::post('/comments', [CommentController::class, 'store']);

    // 🔢 المهام الفرعية (Subtasks)
    Route::put('/subtasks/{id}/toggle', [SubtaskController::class, 'toggleStatus']);

    // 📄 الملفات (Files)
    Route::post('/files/upload', [FileController::class, 'store']);

    // 🔔 الإشعارات (Notifications)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});