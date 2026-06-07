<?php

namespace App\Http\Controllers;

use App\Models\Subtask;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    // تغيير حالة المهمة الفرعية (واش تنجزات أولا باقي)
    public function toggleStatus(Request $request, $id)
    {
        $request->validate([
            'is_done' => 'required|boolean',
        ]);

        $subtask = Subtask::find($id);
        if (!$subtask) {
            return response()->json(['message' => 'Sous-tâche non trouvée'], 404);
        }

        $subtask->is_done = $request->is_done;
        $subtask->save();

        return response()->json([
            'message' => 'Statut de la sous-tâche mis à jour',
            'subtask' => $subtask
        ], 200);
    }
}
