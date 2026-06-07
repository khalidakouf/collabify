<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // المشاريع اللي هو رئيس ديالها (Chef de projet)
    public function managedProjects()
    {
        return $this->hasMany(Project::class, 'chef_id');
    }

    // الخطوة المهمة: المشاريع اللي مشارك فيها كعضو (عبر الجدول الوسيط بلا Model)
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members');
    }

    // المهام الموكلة إليه
    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    // التعليقات اللي كتب
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}