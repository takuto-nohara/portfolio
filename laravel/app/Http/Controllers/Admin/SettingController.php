<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SettingController extends Controller
{
    private const KEYS = ['github_url', 'contact_email'];

    public function edit(): View
    {
        $settings = Setting::whereIn('key', self::KEYS)->pluck('value', 'key');

        return view('admin.settings.edit', compact('settings'));
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'github_url'    => ['nullable', 'url', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value);
        }

        return redirect()->route('admin.settings.edit')
            ->with('success', '設定を保存しました。');
    }
}
