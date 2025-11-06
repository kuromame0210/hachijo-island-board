-- 現在のテーブル構造を確認する

-- 1. テーブルの全カラム情報を取得
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'hachijo_post_board' 
ORDER BY ordinal_position;

-- 2. テーブルの制約情報を確認
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'hachijo_post_board';

-- 3. インデックス情報を確認
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'hachijo_post_board';

-- 4. サンプルデータの確認（最新5件）
SELECT 
    id,
    title,
    category,
    status,
    created_at,
    CASE 
        WHEN images IS NOT NULL THEN array_length(images, 1)
        ELSE 0 
    END as image_count
FROM hachijo_post_board 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. カテゴリ別の投稿数
SELECT 
    category,
    COUNT(*) as count,
    MAX(created_at) as latest_post
FROM hachijo_post_board 
GROUP BY category 
ORDER BY count DESC;