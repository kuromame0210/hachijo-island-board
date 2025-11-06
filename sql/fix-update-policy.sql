-- UPDATEポリシーの条件を修正
-- 現在の条件: status = 'active' のみ更新可能
-- 修正後: すべてのステータスで更新可能（管理者機能のため）

DROP POLICY IF EXISTS "Allow public update access" ON hachijo_post_board;

CREATE POLICY "Allow public update access" ON hachijo_post_board
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 確認: 更新されたポリシー
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board' AND cmd = 'UPDATE';