-- 現在の投稿状況を確認
SELECT 
  id,
  LEFT(title, 30) as title_short,
  status,
  created_at,
  updated_at
FROM hachijo_post_board 
ORDER BY created_at DESC
LIMIT 10;