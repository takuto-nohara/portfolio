<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>お問い合わせ</title>
</head>
<body>
    <h1>お問い合わせ</h1>
    <form method="POST" action="{{ route('contact.store') }}">
        @csrf
        <input type="text" name="name" placeholder="名前" required>
        <input type="email" name="email" placeholder="メールアドレス" required>
        <textarea name="message" placeholder="メッセージ" required></textarea>
        <button type="submit">送信</button>
    </form>
</body>
</html>
