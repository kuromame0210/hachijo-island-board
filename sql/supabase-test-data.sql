-- Add test data for hachijo-board
-- Run this after creating the posts table

INSERT INTO hachijo_post_board (title, description, category, price, contact) VALUES
('八丈島の古民家', '築100年の趣のある古民家です。海が見える素晴らしい立地。', '不動産', 150000, 'example@email.com'),
('カフェスタッフ募集', '八丈島の海を見ながら働けるカフェでスタッフを募集しています。', '仕事', 180000, '090-1234-5678'),
('中古自転車', '島内移動に便利な自転車です。多少の使用感はありますが問題なく使えます。', '不用品', 8000, 'island-bike@test.com'),
('民宿オーナー募集', '八丈島で民宿を運営してくれる方を募集しています。', '仕事', 250000, 'minshuku@hachijo.jp'),
('冷蔵庫譲ります', '引っ越しのため冷蔵庫をお譲りします。2018年製、状態良好。', '不用品', 15000, '080-9999-1111');