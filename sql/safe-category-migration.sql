-- 段階的で安全なカテゴリー移行手順
-- まず調査SQLを実行してから、このSQLを実行してください

-- ステップ1: 現在のデータを調査（実行前に必ず確認）
-- SELECT category, COUNT(*) FROM hachijo_post_board GROUP BY category;

-- ステップ2: 制約を一時的に削除
ALTER TABLE hachijo_post_board 
DROP CONSTRAINT IF EXISTS hachijo_post_board_category_check;

-- ステップ3: データを段階的に変換
-- 3-1. 標準カテゴリーの変換
UPDATE hachijo_post_board 
SET category = 'real_estate' 
WHERE category = '不動産';

UPDATE hachijo_post_board 
SET category = 'job' 
WHERE category = '仕事';

UPDATE hachijo_post_board 
SET category = 'secondhand' 
WHERE category = '不用品';

UPDATE hachijo_post_board 
SET category = 'agriculture' 
WHERE category = '農業';

UPDATE hachijo_post_board 
SET category = 'event' 
WHERE category = 'イベント';

UPDATE hachijo_post_board 
SET category = 'volunteer' 
WHERE category = 'ボランティア';

-- 3-2. 未設定カテゴリーの変換
UPDATE hachijo_post_board 
SET category = 'other' 
WHERE category = '未設定';

-- 3-3. その他の予期しないカテゴリーがあれば 'other' に統合
UPDATE hachijo_post_board 
SET category = 'other' 
WHERE category NOT IN (
  'real_estate', 'job', 'secondhand', 'agriculture', 
  'event', 'volunteer', 'announcement'
);

-- ステップ4: 変換結果を確認
SELECT category, COUNT(*) as count 
FROM hachijo_post_board 
GROUP BY category 
ORDER BY category;

-- ステップ5: 新しい制約を追加
ALTER TABLE hachijo_post_board 
ADD CONSTRAINT hachijo_post_board_category_check 
CHECK (category IN (
  'real_estate',    -- 不動産
  'job',            -- 仕事  
  'secondhand',     -- 不用品
  'agriculture',    -- 農業
  'event',          -- イベント
  'volunteer',      -- ボランティア
  'question',       -- 質問（新規）
  'info',           -- 情報（新規）
  'announcement',   -- お知らせ（新規、広告統合）
  'other'           -- その他（新規）
));

-- ステップ6: 最終確認
SELECT 'Migration completed successfully' as status,
       COUNT(*) as total_records
FROM hachijo_post_board;