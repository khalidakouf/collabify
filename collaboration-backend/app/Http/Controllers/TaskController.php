<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
     // 3. جلب تاسكات مشروع معين
public function index(Request $request)
{
    $projectId = $request->query('project_id') ?? $request->project_id;

    if (!$projectId) {
        return response()->json(['message' => 'project_id requis'], 422);
    }

    $tasks = Task::with('assignee:id,name,role')
        ->where('project_id', $projectId)
        ->get();

    return response()->json($tasks, 200);
}

// 4. تعديل تاسك
public function update(Request $request, $id)
{
    $task = Task::find($id);
    if (!$task) {
        return response()->json(['message' => 'Tâche non trouvée'], 404);
    }

    $request->validate([
        'title'       => 'sometimes|string|max:255',
        'description' => 'nullable|string',
        'assigned_to' => 'nullable|exists:users,id',
        'priority'    => 'sometimes|in:basse,moyenne,haute',
        'deadline'    => 'nullable|date',
        'status'      => 'sometimes|in:a_faire,en_cours,termine',
    ]);

    $task->update($request->only([
        'title', 'description', 'assigned_to',
        'priority', 'deadline', 'status'
    ]));

    return response()->json([
        'message' => 'Tâche mise à jour',
        'task'    => $task->load('assignee:id,name,role')
    ], 200);
}

// 5. حذف تاسك
public function destroy($id)
{
    $task = Task::find($id);
    if (!$task) {
        return response()->json(['message' => 'Tâche non trouvée'], 404);
    }

    $task->delete();

    return response()->json(['message' => 'Tâche supprimée'], 200);
}
    // 1. إنشاء مهمة جديدة وسط مشروع (خاص بالـ Admin والـ Chef)
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:basse,moyenne,haute',
            'deadline' => 'nullable|date',
        ]);

        $task = Task::create([
            'project_id' => $request->project_id,
            'title' => $request->title,
            'description' => $request->description,
            'assigned_to' => $request->assigned_to,
            'priority' => $request->priority,
            'status' => 'a_faire',
            'deadline' => $request->deadline,
        ]);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'task' => $task
        ], 201);
    }

    // 2. تحديث حالة المهمة (A faire, En cours, Terminé)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:a_faire,en_cours,termine',
        ]);

        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }

        $task->status = $request->status;
        $task->save();

        return response()->json([
            'message' => 'Statut de la tâche mis à jour',
            'task' => $task
        ], 200);
    }
}