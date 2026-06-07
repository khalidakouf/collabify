<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // جلب قائمة كاع المستخدمين (باش نخدمو بيها ف الـ Select ف الـ Frontend)
    public function index(Request $request)
{
    $users = User::select('id', 'name', 'email', 'role')
        ->when($request->role, function($query) use ($request) {
            $query->where('role', $request->role);
        })
        ->get();
    
    return response()->json($users, 200);
}
}
