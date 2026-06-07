<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // 1. جلب كاع الإشعارات ديال المستخدم الحالي
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications, 200);
    }

    // 2. تحديد إشعار معين كـ مقروء (Lu)
    public function markAsRead($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification
        ], 200);
    }
}