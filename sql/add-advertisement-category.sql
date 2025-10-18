-- 広告カテゴリーを追加するためのCHECK制約の更新
-- 既存のCHECK制約を削除して、新しい制約を追加

-- 既存のCHECK制約を削除
ALTER TABLE hachijo_post_board 
DROP CONSTRAINT IF EXISTS hachijo_post_board_category_check;

-- 新しいCHECK制約を追加（広告カテゴリーを含む）
ALTER TABLE hachijo_post_board 
ADD CONSTRAINT hachijo_post_board_category_check 
CHECK (category IN (
  'real_estate', 
  'job', 
  'secondhand', 
  'agriculture', 
  'event', 
  'volunteer', 
  'question', 
  'info', 
  'announcement', 
  'other',
  'advertisement',
  '不動産', 
  '仕事', 
  '不用品', 
  '農業', 
  'イベント', 
  'ボランティア',
  '未設定',
  '広告'
));