-- カテゴリーを日本語から英語キーに移行
-- 実行前に必ずデータベースのバックアップを取得してください

-- 1. 既存データの変換
UPDATE hachijo_post_board 
SET category = CASE category
  WHEN '不動産' THEN 'real_estate'
  WHEN '仕事' THEN 'job'
  WHEN '不用品' THEN 'secondhand' 
  WHEN '農業' THEN 'agriculture'
  WHEN 'イベント' THEN 'event'
  WHEN 'ボランティア' THEN 'volunteer'
  WHEN '未設定' THEN 'other'  -- 未設定は「その他」に統合
  WHEN '広告' THEN 'announcement'  -- 広告は「お知らせ」カテゴリーに統合
  -- 万が一他の値がある場合は 'other' に統一
  ELSE 'other'
END;

-- 2. 既存の制約を削除
ALTER TABLE hachijo_post_board 
DROP CONSTRAINT IF EXISTS hachijo_post_board_category_check;

-- 3. 新しい制約を追加（英語キー + 新規カテゴリー対応）
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
  'announcement',   -- お知らせ（新規）
  'other'           -- その他（新規）
));

-- 4. 変換結果の確認クエリ（実行後にチェック用）
-- SELECT category, COUNT(*) as count 
-- FROM hachijo_post_board 
-- GROUP BY category 
-- ORDER BY category;