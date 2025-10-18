-- 八丈島掲示板用ストレージバケット'hachijo-board-posts'を作成

-- バケットが存在するかチェック
SELECT name FROM storage.buckets WHERE name = 'hachijo-board-posts';

-- バケット作成（存在しない場合）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hachijo-board-posts',
    'hachijo-board-posts', 
    true,  -- 公開バケット
    10485760,  -- 10MB制限
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- 既存のポリシーを削除（エラーを無視）
DROP POLICY IF EXISTS "hachijo_board_allow_public_uploads" ON storage.objects;
DROP POLICY IF EXISTS "hachijo_board_allow_public_downloads" ON storage.objects;
DROP POLICY IF EXISTS "hachijo_board_allow_public_updates" ON storage.objects;
DROP POLICY IF EXISTS "hachijo_board_allow_public_deletes" ON storage.objects;

-- パブリックアクセスポリシーを設定
CREATE POLICY "hachijo_board_allow_public_uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'hachijo-board-posts');

CREATE POLICY "hachijo_board_allow_public_downloads" ON storage.objects  
FOR SELECT USING (bucket_id = 'hachijo-board-posts');

CREATE POLICY "hachijo_board_allow_public_updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'hachijo-board-posts');

CREATE POLICY "hachijo_board_allow_public_deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'hachijo-board-posts');

-- 確認
SELECT * FROM storage.buckets WHERE name = 'hachijo-board-posts';