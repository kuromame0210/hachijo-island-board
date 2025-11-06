-- カテゴリー制約更新用SQL
-- 新しいカテゴリーを追加した場合に実行してください

-- カテゴリーを追加したい場合の手順：
-- 1. src/lib/categories.ts に新しいカテゴリーを追加
-- 2. 以下のSQLの IN句に新しいカテゴリーキーを追加
-- 3. このSQLを実行

-- 現在の制約を削除
ALTER TABLE hachijo_post_board 
DROP CONSTRAINT IF EXISTS hachijo_post_board_category_check;

-- 新しい制約を追加（新しいカテゴリーがある場合はここに追加）
ALTER TABLE hachijo_post_board 
ADD CONSTRAINT hachijo_post_board_category_check 
CHECK (category IN (
  'real_estate',    -- 不動産
  'job',            -- 仕事  
  'secondhand',     -- 不用品
  'agriculture',    -- 農業
  'event',          -- イベント
  'volunteer',      -- ボランティア
  'question',       -- 質問
  'info',           -- 情報
  'announcement',   -- お知らせ
  'other'           -- その他
  -- 新しいカテゴリーをここに追加
  -- 例: , 'exchange'  -- 交換
));

-- 確認クエリ
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'hachijo_post_board_category_check';