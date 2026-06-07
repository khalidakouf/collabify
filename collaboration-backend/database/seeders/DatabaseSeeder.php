<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. حساب الـ Admin
        User::create([
            'name' => 'khalid Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // 2. حساب الـ Chef de projet
        User::create([
            'name' => 'khalid Chef',
            'email' => 'chef@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'chef_projet',
        ]);

        // 3. حساب الـ Employé
        User::create([
            'name' => 'khalid Employé',
            'email' => 'employe@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'employe',
        ]);

        // 4. حساب الـ Stagiaire
        User::create([
            'name' => 'khalid Stagiaire',
            'email' => 'stagiaire@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'stagiaire',
        ]);
    }
}
