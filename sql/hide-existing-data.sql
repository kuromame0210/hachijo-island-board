-- 既存のサンプルデータを非表示にする
-- 実行前に確認：既存データの件数とID一覧を表示
SELECT 
  id, 
  title, 
  category, 
  created_at,
  status
FROM hachijo_post_board 
ORDER BY created_at DESC;

-- 既存の全データを'hidden'ステータスに変更
-- 注意：このクエリを実行すると既存データが非表示になります
UPDATE hachijo_post_board 
SET status = 'hidden'
WHERE status = 'active' OR status IS NULL;

-- 実行後の確認：更新されたデータの件数を表示
SELECT 
  status, 
  COUNT(*) as count 
FROM hachijo_post_board 
GROUP BY status;

-- 特定のデータのみ非表示にしたい場合は以下のように条件を指定
-- 例：特定の日付より前のデータのみ
-- UPDATE hachijo_post_board 
-- SET status = 'hidden'
-- WHERE created_at < '2024-01-01' AND (status = 'active' OR status IS NULL);

-- 例：特定のIDのデータのみ
-- UPDATE hachijo_post_board 
-- SET status = 'hidden'
-- WHERE id IN (1, 2, 3, 4, 5) AND (status = 'active' OR status IS NULL);