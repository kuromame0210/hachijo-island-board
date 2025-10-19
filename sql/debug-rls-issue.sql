-- RLS問題の詳細デバッグ

-- 1. 現在のロール・権限を確認
SELECT current_user, session_user;

-- 2. テーブルへの基本権限を確認
SELECT 
  table_name,
  privilege_type,
  grantee,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'hachijo_post_board'
ORDER BY privilege_type;

-- 3. RLSポリシーの詳細を確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board';

-- 4. 対象レコードが存在するか確認
SELECT 
  id,
  title,
  status,
  created_at,
  updated_at
FROM hachijo_post_board 
WHERE id = '537fcf31-2493-434e-81ec-2e798d0537a2';

-- 5. UPDATE条件をテスト（DRY RUN）
EXPLAIN (ANALYZE, BUFFERS) 
UPDATE hachijo_post_board 
SET status = 'hidden', updated_at = NOW()
WHERE id = '537fcf31-2493-434e-81ec-2e798d0537a2';

-- 6. ポリシー評価のテスト
SELECT 
  id,
  status,
  CASE 
    WHEN true THEN 'USING条件: OK'
    ELSE 'USING条件: NG'
  END as using_check,
  CASE 
    WHEN true THEN 'WITH CHECK条件: OK'
    ELSE 'WITH CHECK条件: NG'
  END as with_check_result
FROM hachijo_post_board 
WHERE id = '537fcf31-2493-434e-81ec-2e798d0537a2';