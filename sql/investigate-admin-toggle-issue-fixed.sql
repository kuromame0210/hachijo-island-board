-- 管理画面の非表示機能の調査用SQL（修正版）

-- 1. status列の制約を確認
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'hachijo_post_board' 
  AND column_name = 'status';

-- 2. CHECK制約の詳細確認
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'hachijo_post_board'
  AND tc.constraint_type = 'CHECK';

-- 3. 現在のRLSポリシーを確認
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
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd, policyname;

-- 4. RLS有効状態を確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'hachijo_post_board';

-- 5. 現在の投稿データのstatus分布を確認
SELECT 
  status,
  COUNT(*) as count
FROM hachijo_post_board 
GROUP BY status
ORDER BY count DESC;

-- 6. 最新投稿5件のstatus確認
SELECT 
  id,
  title,
  status,
  created_at,
  updated_at
FROM hachijo_post_board 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. 環境変数の設定状況確認（現在のセッション情報）
SELECT current_user, session_user;

-- 8. UPDATEポリシーの詳細確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board' 
  AND cmd = 'UPDATE';