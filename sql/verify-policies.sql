-- 現在のRLSポリシーを再確認
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd;

-- テーブルのRLS状態確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'hachijo_post_board';