-- 投稿テーブルのRLSを再有効化

-- RLSを有効化
ALTER TABLE hachijo_post_board ENABLE ROW LEVEL SECURITY;

-- 確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'hachijo_post_board';