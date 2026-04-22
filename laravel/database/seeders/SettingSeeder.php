<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'github_url'    => env('GITHUB_URL', '#'),
            'contact_email' => env('MAIL_FROM_ADDRESS', ''),
        ];

        foreach ($defaults as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
