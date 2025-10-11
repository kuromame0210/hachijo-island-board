-- 現在のデータベースに存在するカテゴリーを調査
-- 実行してから移行SQLを調整します

-- 1. 現在存在するすべてのカテゴリーとその件数
SELECT category, COUNT(*) as count 
FROM hachijo_post_board 
GROUP BY category 
ORDER BY count DESC;

-- 2. 現在の制約情報を確認（PostgreSQL 12以降対応）
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'hachijo_post_board_category_check';

-- 3. 各カテゴリーの具体例（最新5件）
SELECT category, title, created_at 
FROM hachijo_post_board 
ORDER BY created_at DESC 
LIMIT 20;