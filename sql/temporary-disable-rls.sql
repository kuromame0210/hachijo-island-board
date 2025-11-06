-- 一時的にRLSを無効にしてテスト
-- ⚠️ 本番環境では絶対に実行しないでください

-- RLSを無効化
ALTER TABLE hachijo_post_board DISABLE ROW LEVEL SECURITY;

-- 確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'hachijo_post_board';