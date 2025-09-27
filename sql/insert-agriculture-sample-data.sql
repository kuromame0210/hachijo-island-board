-- Insert sample agriculture data for hachijo-board
-- Run this SQL in your Supabase SQL Editor after running add-generic-fields.sql

-- 1. レモン苗木定植のサンプル
INSERT INTO hachijo_post_board (
  title,
  description,
  category,
  contact,
  work_date,
  reward_type,
  reward_details,
  conditions,
  tags,
  age_friendly
) VALUES (
  'レモンの苗木(リスボン種)、70本を定植します',
  '一緒に汗を流しませんか!! 完全ボランティアなのですが、終わった後は島酒で乾杯しましょう!! お手伝いしていただける方はご連絡ください!!',
  '農業',
  '八丈島柑橘農園',
  '11月29日(土)、30(日)',
  'non_money',
  '完全ボランティア + 終わった後は島酒で乾杯',
  '苗の納品が11月中旬の予定。11月に入り次第入荷日が決定する為、11月29日までに入荷できなければ、実施日の延期の可能性があります。',
  ARRAY['#八丈島', '#リスボンレモン', '#農業体験'],
  true
);

-- 2. 切り葉のお手伝い
INSERT INTO hachijo_post_board (
  title,
  description,
  category,
  contact,
  work_date,
  reward_type,
  reward_details,
  requirements,
  age_friendly
) VALUES (
  '切り葉のお手伝い募集',
  'シダやアスパラガスなどの切り葉収穫をお手伝いしていただける方を募集しています。作業のコツは丁寧に指導いたします。',
  '農業',
  '八丈島切り葉農園',
  '毎週土日 8:00-12:00',
  'both',
  '時給1000円 + 収穫物のお裾分け',
  '軍手・作業着持参、刃物使用のため慎重な作業ができる方',
  true
);

-- 3. 出荷運搬のお手伝い
INSERT INTO hachijo_post_board (
  title,
  description,
  category,
  contact,
  work_date,
  reward_type,
  reward_details,
  requirements,
  age_friendly
) VALUES (
  '出荷運搬のお手伝い募集',
  '朝の市場・港への農産物運搬をお手伝いいただける方を募集します。軽トラまたは軽箱車をお持ちの方限定です。',
  '農業',
  '八丈農協',
  '毎週火・金 5:30-8:00',
  'money',
  '1回3000円',
  '軽トラまたは軽箱車保有必須、普通免許必要',
  false
);

-- 4. 除草作業
INSERT INTO hachijo_post_board (
  title,
  description,
  category,
  contact,
  work_date,
  reward_type,
  reward_details,
  conditions,
  age_friendly
) VALUES (
  '農地の除草作業手伝い募集',
  '梅雨明け後の除草作業を一緒にやってくださる方を募集します。高校生・中学生も大歓迎！体力に自信のある方お待ちしています。',
  '農業',
  '田中農園',
  '7月20日-8月10日 期間中の土日',
  'non_money',
  '昼食提供 + 農園で採れた野菜お持ち帰り',
  '作業道具は貸与します。飲み物・タオル持参でお願いします。',
  true
);

-- 5. トマト収穫体験
INSERT INTO hachijo_post_board (
  title,
  description,
  category,
  contact,
  work_date,
  reward_type,
  reward_details,
  age_friendly
) VALUES (
  'トマト収穫体験参加者募集',
  '島のトマト農家でトマト収穫を体験してみませんか？農業に興味のある方、島の暮らしを体験したい方大歓迎です！',
  '農業',
  'みどり農園',
  '6月中の土日（要相談）',
  'free',
  '収穫したトマトお持ち帰り + 農園ランチ',
  true
);