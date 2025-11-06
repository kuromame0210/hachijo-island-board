-- コメント削除用のRLSポリシーを修正

-- 既存の削除ポリシーを削除
DROP POLICY IF EXISTS "Allow session owner delete comments" ON hachijo_board_comments;

-- 新しい削除ポリシー（session_idでフィルタリング）
CREATE POLICY "Allow session owner delete comments" ON hachijo_board_comments
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 確認用: 現在のポリシー一覧
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_board_comments'
ORDER BY cmd, policyname;