-- map_linkの実際のデータを調査
-- GoogleMapEmbedエラーの原因特定用

-- 1. map_linkが設定されている投稿を確認
SELECT 
  id,
  title,
  map_link,
  LENGTH(map_link) as link_length,
  created_at
FROM hachijo_post_board 
WHERE map_link IS NOT NULL 
  AND map_link != ''
ORDER BY created_at DESC;

-- 2. map_linkのパターン分析
SELECT 
  CASE 
    WHEN map_link LIKE '%maps.app.goo.gl%' THEN 'goo.gl短縮'
    WHEN map_link LIKE '%google.com/maps%' THEN 'google.com'
    WHEN map_link LIKE '%@%' THEN '座標形式'
    WHEN map_link LIKE '%place_id%' THEN 'place_id形式'
    ELSE 'その他'
  END as link_type,
  COUNT(*) as count,
  STRING_AGG(LEFT(map_link, 50), ', ') as examples
FROM hachijo_post_board 
WHERE map_link IS NOT NULL 
  AND map_link != ''
GROUP BY link_type;