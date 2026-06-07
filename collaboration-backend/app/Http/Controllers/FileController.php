<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    // رفع ملف جديد (الحد الأقصى 2MB)
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'file' => 'required|file|max:2048', // 2MB max
        ]);

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            
            // تخزين الملف ف مجلد storage/app/public/attachments
            $path = $uploadedFile->store('attachments', 'public');

            $file = File::create([
                'project_id' => $request->project_id,
                'uploaded_by' => $request->user()->id,
                'original_name' => $uploadedFile->getClientOriginalName(),
                'stored_name' => basename($path),
                'path' => $path,
                'mime_type' => $uploadedFile->getMimeType(),
                'size' => $uploadedFile->getSize(),
            ]);

            return response()->json([
                'message' => 'Fichier téléchargé avec succès',
                'file' => $file
            ], 201);
        }

        return response()->json(['message' => 'Aucun fichier trouvé'], 400);
    }
}
