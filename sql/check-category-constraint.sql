-- カテゴリ制約の確認

-- 1. テーブルの制約を確認
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'hachijo_post_board' 
    AND tc.constraint_type = 'CHECK'
    AND tc.constraint_name LIKE '%category%';

-- 2. 現在使用されているカテゴリ一覧
SELECT DISTINCT category, COUNT(*) as count
FROM hachijo_post_board 
GROUP BY category 
ORDER BY count DESC;