@extends('layouts.admin')

@section('title', 'お問い合わせ管理 - Admin')
@section('header', '&gt; お問い合わせ管理')

@section('content')

    <div class="flex justify-between items-center mb-8">
        <p class="text-foreground-secondary text-sm">
            受信件数: {{ count($contacts) }}
        </p>
    </div>

    @if (session('success'))
        <div class="mb-6 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded">
            {{ session('success') }}
        </div>
    @endif

    <div class="bg-surface-primary rounded-lg border border-border-subtle overflow-hidden">
        <table class="w-full">
            <thead>
                <tr class="bg-surface-secondary text-foreground-secondary text-xs uppercase tracking-wider">
                    <th class="px-6 py-3 text-left">名前</th>
                    <th class="px-6 py-3 text-left">メール</th>
                    <th class="px-6 py-3 text-left">メッセージ</th>
                    <th class="px-6 py-3 text-left">受信日時</th>
                    <th class="px-6 py-3 text-right">操作</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
                @forelse ($contacts as $contact)
                    <tr class="align-top hover:bg-surface-secondary/50 transition-colors">
                        <td class="px-6 py-4 text-foreground-primary text-sm font-medium whitespace-nowrap">{{ $contact->name }}</td>
                        <td class="px-6 py-4 text-foreground-secondary text-sm whitespace-nowrap">{{ $contact->email }}</td>
                        <td class="px-6 py-4 text-foreground-secondary text-sm max-w-md whitespace-pre-wrap wrap-break-word">{{ $contact->message }}</td>
                        <td class="px-6 py-4 text-foreground-secondary text-sm whitespace-nowrap">{{ $contact->createdAt ?? '-' }}</td>
                        <td class="px-6 py-4 text-right whitespace-nowrap">
                            <form action="{{ route('admin.contacts.destroy', $contact->id) }}" method="POST" class="inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-500 text-xs hover:text-red-700 transition-colors" onclick="return confirm('このお問い合わせを削除しますか？')">
                                    delete
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-10 text-center text-foreground-muted text-sm">お問い合わせはまだありません。</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

@endsection