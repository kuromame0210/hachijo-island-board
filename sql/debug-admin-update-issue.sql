-- 管理画面でのステータス更新問題をデバッグ

-- 1. 現在のRLSポリシーを確認
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd, policyname;

-- 2. 特定の投稿のステータスを確認
SELECT id, title, status, created_at, updated_at 
FROM hachijo_post_board 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. UPDATEポリシーを完全に開放（一時的）
DROP POLICY IF EXISTS "Allow public update access" ON hachijo_post_board;

CREATE POLICY "Allow public update access" ON hachijo_post_board
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 4. 確認: 修正されたポリシー
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board' AND cmd = 'UPDATE';