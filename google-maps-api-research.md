# Google Maps Embed API 調査結果

## 現在の問題

**エラーメッセージ**: `Google Maps Platform rejected your request. Invalid request. Invalid 'pb' parameter.`

## Google Maps Embed API の正しい仕様

### 1. 推奨方法: Maps Embed API v1

#### Place ID形式（推奨）
```
https://www.google.com/maps/embed/v1/place
  ?key=API_KEY
  &q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4
```

#### 座標形式
```
https://www.google.com/maps/embed/v1/view
  ?key=API_KEY
  &center=-33.8569,151.2152
  &zoom=18
  &maptype=satellite
```

#### 検索形式
```
https://www.google.com/maps/embed/v1/search
  ?key=API_KEY
  &q=record+stores+in+Seattle
```

### 2. 問題のあるパラメータ

**現在のコード問題点**:
1. `pb` パラメータは内部APIパラメータで非公開
2. ハードコードされた値 `!1m18!1m12!...` は無効
3. APIキーが必要なのに、pb形式では使用していない

### 3. goo.gl短縮URLの正しい処理方法

#### 短縮URL展開アプローチ
```javascript
// 1. 短縮URLを展開
const expandShortUrl = async (shortUrl) => {
  try {
    const response = await fetch(shortUrl, { 
      method: 'HEAD',
      redirect: 'follow' 
    });
    return response.url; // 展開されたURL
  } catch (error) {
    return null;
  }
};

// 2. 展開されたURLからplace_idや座標を抽出
```

#### Place ID抽出（推奨）
```javascript
// goo.glの最後の部分はplace_idではなく、内部ID
// 正しくはgoo.glを展開してplace_idを取得する必要がある
```

## 解決策の優先順位

### 1. 即座の修正: iframe用URL生成の修正
- `pb`パラメータ使用を停止
- Maps Embed API v1の正しい形式を使用

### 2. 中長期的改善: URL展開機能
- goo.gl短縮URLを正しいGoogleマップURLに展開
- 展開後のURLからplace_idや座標を抽出

### 3. 最適解: 代替表示
- iframe埋め込みでエラーが出る場合
- 「Googleマップで開く」リンクのみ表示

## APIキーの必要性

**Maps Embed API v1を使用する場合**:
- APIキーが必須
- 現在のコードに含まれている `AIzaSyBFw0Qbyq9zTFTd-tUY6dUWTgEiPMiGu8k` は
  サンプルキーの可能性が高い（無効）

## 検証方法

1. デバッグ版でコンソールログ確認
2. 生成されたURLを直接ブラウザで開いてテスト
3. SQLでmap_linkの実際のデータパターン確認