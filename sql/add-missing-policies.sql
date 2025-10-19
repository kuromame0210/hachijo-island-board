-- 不足しているRLSポリシーを追加

-- 既存のポリシーをすべて削除（クリーンアップ）
DROP POLICY IF EXISTS "Allow public read access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow public insert access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow public update access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow admin update access" ON hachijo_post_board;

-- 基本的なポリシーを再作成
-- 1. 読み取り許可（SELECT）
CREATE POLICY "Allow public read access" ON hachijo_post_board
  FOR SELECT 
  TO public 
  USING (true);

-- 2. 挿入許可（INSERT）
CREATE POLICY "Allow public insert access" ON hachijo_post_board
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- 3. 更新許可（UPDATE）- 管理画面用
CREATE POLICY "Allow public update access" ON hachijo_post_board
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 4. 削除許可（DELETE）- 将来の拡張用
CREATE POLICY "Allow public delete access" ON hachijo_post_board
  FOR DELETE 
  TO public 
  USING (true);

-- 確認: 作成されたポリシー一覧
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd, policyname;