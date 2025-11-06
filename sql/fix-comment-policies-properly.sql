-- コメントのRLSポリシーを正しく設定

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Allow public insert comments" ON hachijo_board_comments;
DROP POLICY IF EXISTS "Allow public read active comments" ON hachijo_board_comments;
DROP POLICY IF EXISTS "Allow session owner update comments" ON hachijo_board_comments;
DROP POLICY IF EXISTS "Allow session owner delete comments" ON hachijo_board_comments;

-- 正しいポリシーを作成

-- 1. 読み取り: activeステータスのコメントのみ
CREATE POLICY "Allow public read active comments" ON hachijo_board_comments
  FOR SELECT 
  TO public 
  USING (status = 'active');

-- 2. 挿入: 誰でもコメント投稿可能
CREATE POLICY "Allow public insert comments" ON hachijo_board_comments
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- 3. 更新: すべてのUPDATE操作を許可（削除はUPDATEで status='deleted' にするため）
CREATE POLICY "Allow all update comments" ON hachijo_board_comments
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 確認用: 作成されたポリシー一覧
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'hachijo_board_comments'
ORDER BY cmd, policyname;