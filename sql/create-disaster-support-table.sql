-- 台風復旧支援要請用テーブルを作成

CREATE TABLE disaster_support_requests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,                    -- タイトル
  request_type TEXT NOT NULL CHECK (      -- 要請種別
    request_type IN ('cleanup', 'repair', 'transport', 'supply', 'rescue', 'medical', 'other')
  ),
  urgency_level TEXT NOT NULL CHECK (     -- 緊急度
    urgency_level IN ('emergency', 'urgent', 'normal', 'low')
  ),
  description TEXT NOT NULL,              -- 状況詳細
  location_detail TEXT NOT NULL,          -- 場所・住所
  contact TEXT NOT NULL,                  -- 連絡先
  needed_help TEXT,                       -- 必要な支援・物資
  deadline TEXT,                          -- 希望期限
  images TEXT[] DEFAULT '{}',             -- 画像URL配列
  status TEXT DEFAULT 'active' CHECK (    -- ステータス
    status IN ('active', 'completed', 'cancelled', 'hidden')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを追加
CREATE INDEX idx_disaster_support_requests_status ON disaster_support_requests(status);
CREATE INDEX idx_disaster_support_requests_urgency ON disaster_support_requests(urgency_level);
CREATE INDEX idx_disaster_support_requests_type ON disaster_support_requests(request_type);
CREATE INDEX idx_disaster_support_requests_created_at ON disaster_support_requests(created_at DESC);

-- RLSポリシーを設定
ALTER TABLE disaster_support_requests ENABLE ROW LEVEL SECURITY;

-- 読み取り権限（activeステータスのみ公開表示）
CREATE POLICY "Allow public read active requests" ON disaster_support_requests
FOR SELECT USING (status = 'active');

-- 挿入権限（すべてのユーザーが投稿可能）
CREATE POLICY "Allow public insert" ON disaster_support_requests
FOR INSERT WITH CHECK (true);

-- 更新権限（必要に応じて後で追加）
-- CREATE POLICY "Allow update own requests" ON disaster_support_requests
-- FOR UPDATE USING (auth.uid() = user_id);

-- updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_disaster_support_requests_updated_at 
BEFORE UPDATE ON disaster_support_requests 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ（テスト用）
-- INSERT INTO disaster_support_requests (
--   title, 
--   request_type, 
--   urgency_level, 
--   description, 
--   location_detail, 
--   contact, 
--   needed_help,
--   deadline
-- ) VALUES (
--   '屋根の修理をお願いします',
--   'repair',
--   'urgent',
--   '台風で屋根の一部が破損し、雨漏りが発生しています。ブルーシートでの応急処置も含めて対応をお願いします。',
--   '三根地区 ○○商店近く',
--   '電話: 04996-2-xxxx\nメール: example@example.com',
--   'ブルーシート、ハンマー、釘、大人2-3名の人手',
--   '明日まで'
-- );