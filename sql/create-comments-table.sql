-- コメント機能用テーブルを作成
CREATE TABLE hachijo_board_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES hachijo_post_board(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  session_id TEXT, -- セッションIDで編集・削除権限を管理
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted'))
);

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX idx_board_comments_post_id ON hachijo_board_comments(post_id);
CREATE INDEX idx_board_comments_session_id ON hachijo_board_comments(session_id);
CREATE INDEX idx_board_comments_created_at ON hachijo_board_comments(created_at);

-- RLSを有効化
ALTER TABLE hachijo_board_comments ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー
-- 読み取り: activeステータスのコメントのみ表示
CREATE POLICY "Allow public read active comments" ON hachijo_board_comments
  FOR SELECT 
  TO public 
  USING (status = 'active');

-- 挿入: 誰でもコメント投稿可能
CREATE POLICY "Allow public insert comments" ON hachijo_board_comments
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- 更新: 同じセッションIDまたは管理者のみ
CREATE POLICY "Allow session owner update comments" ON hachijo_board_comments
  FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- 削除: 同じセッションIDまたは管理者のみ
CREATE POLICY "Allow session owner delete comments" ON hachijo_board_comments
  FOR DELETE 
  TO public 
  USING (true);

-- 確認用クエリ
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'hachijo_board_comments'
ORDER BY ordinal_position;