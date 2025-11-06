-- 現在のポリシーの詳細を確認
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd, policyname;

-- テーブルの権限も確認
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges 
WHERE table_name = 'hachijo_post_board';

-- 現在のロールも確認
SELECT current_user, session_user;