-- 連絡先公開フラグカラムの追加
-- 物資提供の投稿者が連絡先（電話番号・メール）を公開するか選択できるようにする

-- contact_public カラムを追加
ALTER TABLE hachijo_post_board
ADD COLUMN IF NOT EXISTS contact_public BOOLEAN DEFAULT false;

-- コメント追加（カラムの説明）
COMMENT ON COLUMN hachijo_post_board.contact_public IS '連絡先を公開するかどうか（true: 公開、false: 非公開・コメントのみ）';

-- インデックス追加（公開/非公開でフィルタリングする場合に備えて）
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_contact_public
ON hachijo_post_board(contact_public);

-- 既存データはデフォルトで非公開（false）に設定
-- 新規カラム追加時にDEFAULT falseが適用されるため、明示的なUPDATEは不要
-- ただし、念のため確認クエリを用意

-- 確認用クエリ（実行してカラムが追加されたか確認）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'hachijo_post_board'
  AND column_name = 'contact_public';

-- データ確認用クエリ（既存投稿のcontact_publicがfalseになっているか確認）
-- SELECT id, title, contact_public
-- FROM hachijo_post_board
-- LIMIT 10;
