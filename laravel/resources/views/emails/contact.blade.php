<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>お問い合わせ</title>
</head>
<body style="font-family: sans-serif; color: #333; line-height: 1.6;">
    <h2>お問い合わせが届きました</h2>

    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
            <th style="text-align: left; padding: 8px 12px; background: #f5f5f5; border: 1px solid #ddd; width: 120px;">お名前</th>
            <td style="padding: 8px 12px; border: 1px solid #ddd;">{{ $contact->name }}</td>
        </tr>
        <tr>
            <th style="text-align: left; padding: 8px 12px; background: #f5f5f5; border: 1px solid #ddd;">メールアドレス</th>
            <td style="padding: 8px 12px; border: 1px solid #ddd;">{{ $contact->email }}</td>
        </tr>
        <tr>
            <th style="text-align: left; padding: 8px 12px; background: #f5f5f5; border: 1px solid #ddd; vertical-align: top;">メッセージ</th>
            <td style="padding: 8px 12px; border: 1px solid #ddd; white-space: pre-wrap;">{{ $contact->message }}</td>
        </tr>
    </table>
</body>
</html>
