<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品管理</title>
</head>
<body>
    <h1>作品管理</h1>
    <a href="{{ route('admin.works.create') }}">新規作成</a>

    <table>
        <thead>
            <tr>
                <th>タイトル</th>
                <th>カテゴリ</th>
                <th>説明</th>
                <th>サムネイル</th>
                <th>URL</th>
                <th>GitHub URL</th>
                <th>公開日</th>
                <th>表示順</th>
                <th>作成日</th>
                <th>更新日</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
        @foreach ($workList as $work)
            <tr>
                <td>{{ $work->title }}</td>
                <td>{{ $work->category->value }}</td>
                <td>{{ $work->description }}</td>
                <td>{{ $work->thumbnail }}</td>
                <td>{{ $work->url }}</td>
                <td>{{ $work->githubUrl }}</td>
                <td>{{ $work->publishedAt }}</td>
                <td>{{ $work->sortOrder }}</td>
                <td>{{ $work->createdAt }}</td>
                <td>{{ $work->updatedAt }}</td>
                <td>
                    <a href="{{ route('admin.works.edit', $work->id) }}">編集</a>
                    <form action="{{ route('admin.works.destroy', $work->id) }}" method="POST" style="display:inline;">
                        @csrf
                        @method('DELETE')
                        <button type="submit">削除</button>
                    </form>
                </td>
            </tr>
        @endforeach
    </table>
</body>

</html>
