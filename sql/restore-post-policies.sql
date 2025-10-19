-- 投稿テーブルの必要なRLSポリシーを復元

-- 既存のポリシーをクリーンアップ
DROP POLICY IF EXISTS "Allow public read access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow public insert access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow public update access" ON hachijo_post_board;
DROP POLICY IF EXISTS "Allow admin update access" ON hachijo_post_board;

-- 必要なポリシーを作成

-- 1. 読み取り: activeステータスの投稿のみ公開表示
CREATE POLICY "Allow public read access" ON hachijo_post_board
  FOR SELECT 
  TO public 
  USING (status = 'active');

-- 2. 挿入: 誰でも投稿可能
CREATE POLICY "Allow public insert access" ON hachijo_post_board
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- 3. 更新: 管理機能用（ステータス変更を含む全ての更新を許可）
CREATE POLICY "Allow admin update access" ON hachijo_post_board
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
WHERE tablename = 'hachijo_post_board'
ORDER BY cmd, policyname;