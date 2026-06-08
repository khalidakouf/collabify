<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    // جلب ملفات مشروع معين
    public function index($projectId)
    {
        $files = File::with('uploader:id,name')
            ->where('project_id', $projectId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($file) {
                $file->url = Storage::url($file->path);
                return $file;
            });

        return response()->json($files, 200);
    }

    // رفع ملف جديد (الحد الأقصى 2MB)
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'file'       => 'required|file|max:2048|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ]);

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');

            // تخزين الملف ف مجلد storage/app/public/attachments
            $path = $uploadedFile->store('attachments', 'public');

            $file = File::create([
                'project_id'    => $request->project_id,
                'uploaded_by'   => $request->user()->id,
                'original_name' => $uploadedFile->getClientOriginalName(),
                'stored_name'   => basename($path),
                'path'          => $path,
                'mime_type'     => $uploadedFile->getMimeType(),
                'size'          => $uploadedFile->getSize(),
            ]);

            $file->url = Storage::url($path);

            return response()->json([
                'message' => 'Fichier téléchargé avec succès',
                'file'    => $file
            ], 201);
        }

        return response()->json(['message' => 'Aucun fichier trouvé'], 400);
    }
}
