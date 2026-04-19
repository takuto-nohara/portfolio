<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品詳細</title>
</head>
<body>
    <h1>{{ $workDetail->title }}</h1>
    <p>{{ $workDetail->description }}</p>
    <p>カテゴリ：{{ $workDetail->category->value }}</p>
    <p>技術スタック：{{ $workDetail->techStack }}</p>
    @if ($workDetail->url)
        <a href="{{ $workDetail->url }}" target="_blank">sサイトを見る</a>
    @endif
</body>
</html>
