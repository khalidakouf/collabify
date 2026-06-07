<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
    'project_id',
    'title',
    'description',
    'priority',
    'deadline',
    'assigned_to',
    'status'
];

    // المشروع اللي تابعة ليه المهمة
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // المستخدم اللي مكلف بالمهمة
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // المهام الفرعية (Checklist)
    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }

    // التعليقات اللي وسط هاد المهمة
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}