<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品作成</title>
</head>
<body>
    <h1>作品作成</h1>
    <form action="{{ route('admin.works.store') }}" method="POST">
        @csrf
        <div>
            <label for="title">タイトル</label>
            <input type="text" id="title" name="title" value="{{ old('title') }}">
        </div>
        <div>
            <label for="category">カテゴリ</label>
            <select id="category" name="category">
                <option value="" {{ old('category') == '' ? 'selected' : '' }}>選択してください</option>
                <option value="app" {{ old('category') == 'app' ? 'selected' : '' }}>アプリ</option>
                <option value="web" {{ old('category') == 'web' ? 'selected' : '' }}>Web</option>
                <option value="video" {{ old('category') == 'video' ? 'selected' : '' }}>動画</option>
                <option value="graphic" {{ old('category') == 'graphic' ? 'selected' : '' }}>グラフィック</option>
            </select>
        </div>
        <div>
            <label for="description">説明</label>
            <textarea id="description" name="description">{{ old('description') }}</textarea>
        </div>
        <div>
            <label for="tech_stack">技術スタック</label>
            <input type="text" id="tech_stack" name="tech_stack" value="{{ old('tech_stack') }}">
        </div>
        <div>
            <label for="thumbnail">サムネイル</label>
            <input type="text" id="thumbnail" name="thumbnail" value="{{ old('thumbnail') }}">
        </div>
        <div>
            <label for="url">URL</label>
            <input type="text" id="url" name="url" value="{{ old('url') }}">
        </div>
        <div>
            <label for="github_url">GitHub URL</label>
            <input type="text" id="github_url" name="github_url" value="{{ old('github_url') }}">
        </div>
        <div>
            <label for="published_at">公開日</label>
            <input type="date" id="published_at" name="published_at" value="{{ old('published_at') }}">
        </div>
        <div>
            <label for="is_featured">公開</label>
            <input type="checkbox" id="is_featured" name="is_featured" value="1" {{ old('is_featured') ? 'checked' : '' }}>
        </div>
        <div>
            <label for="sort_order">表示順</label>
            <input type="number" id="sort_order" name="sort_order" value="{{ old('sort_order') }}">
        </div>
        <button type="submit">作成</button>
    </form>
</body>
</html>

