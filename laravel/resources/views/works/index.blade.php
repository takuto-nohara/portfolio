<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品一覧</title>
</head>
<body>
    <h1>作品一覧</h1>
    <ul>
        @foreach ($workList as $work)
            <li>
                <a href="{{ route('works.show', $work->id) }}">{{ $work->title }}</a>
            </li>
        @endforeach
    </ul>
</body>
</html>
