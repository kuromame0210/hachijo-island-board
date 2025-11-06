-- コメント削除に対応したRLSポリシーを設定

-- RLSを再有効化
ALTER TABLE hachijo_board_comments ENABLE ROW LEVEL SECURITY;

-- 既存のUPDATEポリシーを削除
DROP POLICY IF EXISTS "Allow all update comments" ON hachijo_board_comments;

-- 新しいUPDATEポリシー（削除操作に対応）
CREATE POLICY "Allow update comments for deletion" ON hachijo_board_comments
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (status IN ('active', 'deleted')); -- activeまたはdeletedへの変更を許可

-- 確認用: ポリシー一覧
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_board_comments'
ORDER BY cmd, policyname;