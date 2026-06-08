<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // 1. جلب قائمة كاع المستخدمين
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->when($request->role, function ($query) use ($request) {
                $query->where('role', $request->role);
            })
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        return response()->json($users, 200);
    }

    // 2. إنشاء مستخدم جديد (Admin فقط)
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin,chef_projet,employe,stagiaire',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user'    => $user->only(['id', 'name', 'email', 'role', 'created_at']),
        ], 201);
    }

    // 3. Modifier un utilisateur (Admin فقط)
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($id)],
            'password' => 'sometimes|nullable|string|min:6',
            'role'     => 'sometimes|in:admin,chef_projet,employe,stagiaire',
        ]);

        $updateData = $request->only(['name', 'email', 'role']);

        // كيبدل الباسوورد غير إذا صيفطوه
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Utilisateur modifié avec succès',
            'user'    => $user->fresh()->only(['id', 'name', 'email', 'role', 'created_at']),
        ], 200);
    }

    // 4. حذف مستخدم (Admin فقط) - مع حماية ضد حذف الـ Admin الوحيد
    public function destroy(Request $request, $id)
    {
        // لا يمكن للأدمن حذف نفسه
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}
