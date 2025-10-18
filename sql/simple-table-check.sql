-- シンプルなテーブル構造確認

-- 1. 基本的なカラム情報のみ
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'hachijo_post_board' 
ORDER BY ordinal_position;

-- 2. 実際のデータ確認（1件のみ）
SELECT * FROM hachijo_post_board LIMIT 1;

-- 3. 災害支援カテゴリのデータがあるかチェック
SELECT COUNT(*) as disaster_support_count 
FROM hachijo_post_board 
WHERE category = 'disaster_support';

-- 4. statusカラムが存在するかチェック
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'hachijo_post_board' 
            AND column_name = 'status'
        ) THEN 'statusカラム: 存在する'
        ELSE 'statusカラム: 存在しない'
    END as status_check;

-- 5. imagesカラムが存在するかチェック  
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'hachijo_post_board' 
            AND column_name = 'images'
        ) THEN 'imagesカラム: 存在する'
        ELSE 'imagesカラム: 存在しない'
    END as images_check;