<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品編集</title>
</head>
<body>
    <h1>作品編集</h1>
    <form action="{{ route('admin.works.update', $workDetail->id) }}" method="POST">
        @csrf
        @method('PUT')
        <div>
            <label for="title">タイトル</label>
            <input type="text" id="title" name="title" value="{{ old('title', $workDetail->title) }}">
        </div>
        <div>
            <label for="category">カテゴリ</label>
            <select id="category" name="category">
                <option value="" {{ old('category', $workDetail->category->value) == '' ? 'selected' : '' }}>選択してください</option>
                <option value="app" {{ old('category', $workDetail->category->value) == 'app' ? 'selected' : '' }}>アプリ</option>
                <option value="web" {{ old('category', $workDetail->category->value) == 'web' ? 'selected' : '' }}>Web</option>
                <option value="video" {{ old('category', $workDetail->category->value) == 'video' ? 'selected' : '' }}>動画</option>
                <option value="graphic" {{ old('category', $workDetail->category->value) == 'graphic' ? 'selected' : '' }}>グラフィック</option>
            </select>
        </div>
        <div>
            <label for="description">説明</label>
            <textarea id="description" name="description">{{ old('description', $workDetail->description) }}</textarea>
        </div>
        <div>
            <label for="tech_stack">技術スタック</label>
            <input type="text" id="tech_stack" name="tech_stack" value="{{ old('tech_stack', $workDetail->techStack) }}">
        </div>
        <div>
            <label for="thumbnail">サムネイル</label>
            <input type="text" id="thumbnail" name="thumbnail" value="{{ old('thumbnail', $workDetail->thumbnail) }}">
        </div>
        <div>
            <label for="url">URL</label>
            <input type="text" id="url" name="url" value="{{ old('url', $workDetail->url) }}">
        </div>
        <div>
            <label for="github_url">GitHub URL</label>
            <input type="text" id="github_url" name="github_url" value="{{ old('github_url', $workDetail->githubUrl) }}">
        </div>
        <div>
            <label for="published_at">公開日</label>
            <input type="date" id="published_at" name="published_at" value="{{ old('published_at', $workDetail->publishedAt) }}">
        </div>
        <div>
            <label for="is_featured">公開</label>
            <input type="checkbox" id="is_featured" name="is_featured" value="1" {{ old('is_featured', $workDetail->isFeatured) ? 'checked' : '' }}>
        </div>
        <div>
            <label for="sort_order">表示順</label>
            <input type="number" id="sort_order" name="sort_order" value="{{ old('sort_order', $workDetail->sortOrder) }}">
        </div>
        <button type="submit">更新</button>
    </form>
</body>
</html>

