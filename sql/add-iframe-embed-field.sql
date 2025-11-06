-- iframe埋め込みコード用のフィールドを追加
-- Googleマップの「埋め込み」機能で取得したiframeコードを保存

ALTER TABLE hachijo_post_board 
ADD COLUMN IF NOT EXISTS iframe_embed TEXT;

-- コメント追加
COMMENT ON COLUMN hachijo_post_board.iframe_embed IS 'Google Maps等のiframe埋め込みコード';

-- 確認
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'hachijo_post_board' 
  AND column_name IN ('map_link', 'iframe_embed');