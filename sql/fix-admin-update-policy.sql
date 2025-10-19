-- 管理画面からのUPDATE操作を許可するポリシーを追加/更新

-- 既存のUPDATEポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow public update access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow admin update access" ON hachijo_post_board;

-- 新しいUPDATEポリシーを作成（より緩い条件）
CREATE POLICY "Allow admin update access" ON hachijo_post_board
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 確認用: 現在のポリシー一覧を表示
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd;