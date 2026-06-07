<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'chef_id',
        'status',
        'deadline',
    ];

    // رئيس المشروع لي تابع ليه هاد المشروع
    public function chef()
    {
        return $this->belongsTo(User::class, 'chef_id');
    }

    // أعضاء المشروع (عبر الجدول الوسيط project_members)
    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members');
    }

    // المهام اللي وسط المشروع
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // الملفات اللي ترفعوا ف هاد المشروع
    public function files()
    {
        return $this->hasMany(File::class);
    }
}