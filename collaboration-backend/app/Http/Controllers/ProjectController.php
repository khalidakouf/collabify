<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    // 1. عرض المشاريع على حسب دور المستخدم
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $projects = Project::with('chef')->get();
        } elseif ($user->role === 'chef_projet') {
            $projects = Project::where('chef_id', $user->id)->with('chef')->get();
        } else {
            // الموظف أو المتدرب كيشوف غير المشاريع اللي هو عضو فيها
            $projects = $user->projects()->with('chef')->get();
        }

        return response()->json($projects, 200);
    }

    // 2. إنشاء مشروع جديد مع المهام ديالو ف دقة واحدة (بإستعمال الـ Transaction)
    public function store(Request $request)
    {
        // الـ Validation المشترك للمشروع ولستة ديال الـ Tasks
        $request->validate([
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'deadline'          => 'nullable|date',
            'tasks'             => 'required|array|min:1', // خاص ضروري تصيفط لستة فيها على الأقل تاسك واحد
            'tasks.*.title'     => 'required|string|max:255',
            'tasks.*.priority'  => 'required|in:basse,moyenne,haute',
            'tasks.*.assigned_to' => 'nullable|exists:users,id',
            'tasks.*.description' => 'nullable|string',
        ]);

        // بدء المعاملة الآمنة مع الداتابيز
        DB::beginTransaction();

        try {
            // أ) إنشاء المشروع أولاً
            $project = Project::create([
                'title'       => $request->title,
                'description' => $request->description,
                'chef_id'     => $request->user()->id, 
                'status'      => 'en_cours',
                'deadline'    => $request->deadline,
            ]);

            // ب) إنشاء الـ Tasks المرتبطة بالمشروع أوتوماتيكياً
            foreach ($request->tasks as $taskData) {
                Task::create([
                    'project_id'  => $project->id,
                    'title'       => $taskData['title'],
                    'description' => $taskData['description'] ?? null,
                    'priority'    => $taskData['priority'],
                    'assigned_to' => $taskData['assigned_to'] ?? null,
                    'status'      => 'a_faire', // الديفو ديال أي تاسك جديدة
                ]);
            }

            // ج) حفظ التغييرات كاملة يلا داز كولشي بنجاح
            DB::commit();

            // د) جلب الـ Tasks الجداد مع الـ Relation ديال الـ Assignee باش نصيفطوهم واجدين للـ React
            $projectTasks = Task::with('assignee:id,name,role')
                ->where('project_id', $project->id)
                ->get();

            return response()->json([
                'message' => 'Projet et tâches créés avec succès',
                'project' => $project,
                'tasks'   => $projectTasks
            ], 201);

        } catch (\Exception $e) {
            // يلا طاحت أي إيرور، كأن شيئاً لم يكن!
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de l\'initialisation : ' . $e->getMessage()
            ], 500);
        }
    }

        // زيادة: تعديل معلومات مشروع (خاص بالـ Admin أو الـ Chef مول المشروع)
    public function update(Request $request, $id)
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        // الحماية: غير الـ Admin أو الـ Chef اللي كريا المشروع هما اللي عندهم الحق يعدلوه
        if ($request->user()->role !== 'admin' && $project->chef_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'status' => 'required|in:en_cours,termine,annule',
        ]);

        $project->update([
            'title' => $request->title,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Projet modifié avec succès',
            'project' => $project->load('chef')
        ], 200);
    }

    // 3. عرض تفاصيل مشروع معين مع المهام ديالو
    public function show($id)
    {
        $project = Project::with(['chef', 'members', 'tasks'])->find($id);

        if (!$project) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        return response()->json($project, 200);
    }

    // 4. حذف مشروع (خاص بالـ Admin أو الـ Chef مول المشروع)
    public function destroy(Request $request, $id)
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        // الحماية: غير الـ Admin أو الـ Chef اللي كcreate المشروع هما اللي يحذفوه
        if ($request->user()->role !== 'admin' && $project->chef_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $project->delete();
        return response()->json(['message' => 'Projet supprimé avec succès'], 200);
    }
}