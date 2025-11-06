-- 投稿ステータス管理用のカラムを追加
-- active: 通常表示（デフォルト）
-- hidden: 非表示（サンプルデータ等）
-- deleted: 削除済み

-- statusカラムを追加（デフォルト値はactive）
ALTER TABLE hachijo_post_board 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted'));

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX idx_hachijo_post_board_status ON hachijo_post_board(status);

-- RLSポリシーを更新（status='active'のみ表示）
DROP POLICY IF EXISTS "Allow public read access" ON hachijo_post_board;
CREATE POLICY "Allow public read access" ON hachijo_post_board
FOR SELECT USING (status = 'active');

-- 管理者用ポリシー（必要に応じて後で追加）
-- CREATE POLICY "Allow admin access to all" ON hachijo_post_board
-- FOR ALL USING (auth.jwt() ->> 'role' = 'admin');