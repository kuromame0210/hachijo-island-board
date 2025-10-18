-- 災害支援カテゴリーを制約に追加するSQL

-- 現在の制約を削除
ALTER TABLE hachijo_post_board 
DROP CONSTRAINT IF EXISTS hachijo_post_board_category_check;

-- 新しい制約を追加（disaster_supportを含む）
ALTER TABLE hachijo_post_board 
ADD CONSTRAINT hachijo_post_board_category_check 
CHECK (category IN (
  'real_estate',      -- 不動産
  'job',              -- 仕事  
  'secondhand',       -- 不用品
  'agriculture',      -- 農業
  'event',            -- イベント
  'volunteer',        -- ボランティア
  'question',         -- 質問
  'info',             -- 情報
  'announcement',     -- お知らせ
  'other',            -- その他
  'advertisement',    -- 広告
  'disaster_support'  -- 災害支援
));

-- 確認クエリ
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'hachijo_post_board_category_check';