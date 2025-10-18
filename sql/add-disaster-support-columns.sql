-- 既存テーブルに災害支援用カラムを追加（オプション）

-- 複数画像用の配列カラム
ALTER TABLE hachijo_post_board 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- ステータス管理用カラム  
ALTER TABLE hachijo_post_board 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted'));

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_status ON hachijo_post_board(status);
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_category ON hachijo_post_board(category);

-- RLSポリシー更新（status='active'のみ表示）
DROP POLICY IF EXISTS "Allow public read access" ON hachijo_post_board;
CREATE POLICY "Allow public read access" ON hachijo_post_board
FOR SELECT USING (status = 'active' OR status IS NULL);