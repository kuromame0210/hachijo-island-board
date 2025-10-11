# API テストガイド

## 前提条件
- ローカルサーバーが http://localhost:3000 で動作中
- 管理者認証が必要（編集API用）

## 1. 管理者認証テスト

### パスワード認証
```bash
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password": "YOUR_ADMIN_PASSWORD"}' \
  -c cookies.txt
```

### 認証確認
```bash
curl -X GET http://localhost:3000/api/admin/verify \
  -b cookies.txt
```

## 2. 投稿編集テスト

### 既存投稿を編集（例：agriculture カテゴリーに変更）
```bash
# 最初に投稿IDを確認
# ブラウザで http://localhost:3000 にアクセスして投稿のIDをコピー

# 投稿を編集
curl -X PUT http://localhost:3000/api/posts/707481c1-a3a5-4fa1-82e3-b66795c86efd \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "トマト収穫体験参加者募集（編集テスト）",
    "description": "島のトマト農家でトマト収穫を体験してみませんか？農業に興味のある方、島の暮らしを体験したい方大歓迎です！【編集テスト済み】",
    "category": "agriculture",
    "contact": "みどり農園（編集テスト）",
    "tags": ["農業", "体験", "テスト"],
    "reward_type": "non_money",
    "reward_details": "トマトのお土産付き",
    "requirements": "特に無し",
    "age_friendly": true,
    "map_link": "https://maps.app.goo.gl/emN5UZBgvEch2fsf8"
  }'
```

## 3. 直接データベース投稿作成（Supabase経由）

ブラウザで新規投稿フォームを使用：
1. http://localhost:3000/new にアクセス
2. 以下のテストデータで投稿作成：

```
タイトル: APIテスト用投稿
カテゴリ: question
内容: これはAPIテストのために作成した投稿です
連絡先: test@example.com
タグ: テスト,API,確認
```

## 4. エラー確認用テスト

### 無効なカテゴリーでテスト
```bash
curl -X PUT http://localhost:3000/api/posts/YOUR_POST_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "エラーテスト",
    "description": "無効なカテゴリーでテスト",
    "category": "invalid_category",
    "contact": "test@example.com"
  }'
```

### 認証なしでテスト
```bash
curl -X PUT http://localhost:3000/api/posts/YOUR_POST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "認証なしテスト",
    "description": "認証なしでテスト",
    "category": "agriculture",
    "contact": "test@example.com"
  }'
```

## 5. レスポンス確認

### 成功時（200）
```json
{
  "message": "Post updated successfully",
  "post": { ... }
}
```

### 認証エラー（401）
```json
{
  "error": "Unauthorized"
}
```

### バリデーションエラー（400）
```json
{
  "error": "Missing required fields"
}
```

### データベースエラー（500）
```json
{
  "error": "Failed to update post",
  "details": "..."
}
```