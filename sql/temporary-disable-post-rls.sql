-- 一時的に投稿テーブルのRLSを無効化してテスト
-- ⚠️ 本番環境では注意して使用してください

-- RLSを無効化
ALTER TABLE hachijo_post_board DISABLE ROW LEVEL SECURITY;

-- 確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'hachijo_post_board';