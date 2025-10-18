-- statusカラムだけを追加（imagesは既に存在）

-- statusカラムを追加
ALTER TABLE hachijo_post_board 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'hidden', 'deleted'));

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_status ON hachijo_post_board(status);

-- 既存データのstatusを'active'に設定
UPDATE hachijo_post_board 
SET status = 'active' 
WHERE status IS NULL;

-- RLSポリシー更新（status='active'のみ表示）
DROP POLICY IF EXISTS "Allow public read access" ON hachijo_post_board;
CREATE POLICY "Allow public read access" ON hachijo_post_board
FOR SELECT USING (status = 'active' OR status IS NULL);