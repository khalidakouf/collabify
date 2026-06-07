<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['user_id', 'message', 'type', 'notifiable_id', 'notifiable_type', 'is_read'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // هادي للـ MorphRelation يلا حتاجيناها من بعد
    public function notifiable()
    {
        return $this->morphTo();
    }
}