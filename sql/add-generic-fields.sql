-- Add generic fields to hachijo_post_board table for enhanced functionality
-- Run this SQL in your Supabase SQL Editor

-- Add new columns for flexible post types
ALTER TABLE hachijo_post_board
ADD COLUMN IF NOT EXISTS work_date TEXT, -- イベント・作業の実施日時
ADD COLUMN IF NOT EXISTS conditions TEXT, -- 条件・注意事項・備考
ADD COLUMN IF NOT EXISTS tags TEXT[], -- タグ・ハッシュタグ
ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'money', -- 報酬・対価の種別
ADD COLUMN IF NOT EXISTS reward_details TEXT, -- 報酬・対価の詳細内容
ADD COLUMN IF NOT EXISTS requirements TEXT, -- 参加・応募に必要な条件・資格
ADD COLUMN IF NOT EXISTS age_friendly BOOLEAN DEFAULT false; -- 年少者参加可能フラグ

-- Update category constraint to support more categories
ALTER TABLE hachijo_post_board
DROP CONSTRAINT IF EXISTS hachijo_post_board_category_check;

ALTER TABLE hachijo_post_board
ADD CONSTRAINT hachijo_post_board_category_check
CHECK (category IN ('不動産', '仕事', '不用品', '農業', 'イベント', 'ボランティア'));

-- Add constraint for reward_type
ALTER TABLE hachijo_post_board
ADD CONSTRAINT hachijo_post_board_reward_type_check
CHECK (reward_type IN ('money', 'non_money', 'both', 'free'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_reward_type ON hachijo_post_board(reward_type);
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_age_friendly ON hachijo_post_board(age_friendly);
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_work_date ON hachijo_post_board(work_date);

-- Add comments for documentation
COMMENT ON COLUMN hachijo_post_board.work_date IS 'イベントや作業の実施日時';
COMMENT ON COLUMN hachijo_post_board.conditions IS '条件・注意事項・補足情報';
COMMENT ON COLUMN hachijo_post_board.tags IS 'タグ・ハッシュタグの配列';
COMMENT ON COLUMN hachijo_post_board.reward_type IS '報酬種別: money(金銭), non_money(物品・サービス), both(混合), free(無償)';
COMMENT ON COLUMN hachijo_post_board.reward_details IS '報酬・対価の具体的な内容';
COMMENT ON COLUMN hachijo_post_board.requirements IS '参加・応募に必要な条件・資格・持参品';
COMMENT ON COLUMN hachijo_post_board.age_friendly IS '年少者(高校生・中学生等)参加可能フラグ';