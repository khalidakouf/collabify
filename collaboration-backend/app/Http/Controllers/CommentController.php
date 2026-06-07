<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // إضافة تعليق جديد وسط المهمة
    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'content' => 'required|string',
        ]);

        $comment = Comment::create([
            'task_id' => $request->task_id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Commentaire ajouté avec succès',
            'comment' => $comment->load('user')
        ], 201);
    }
}