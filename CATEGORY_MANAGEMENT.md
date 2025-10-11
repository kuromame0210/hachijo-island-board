# カテゴリー管理ガイド

## 概要

このプロジェクトでは、カテゴリーを `src/lib/categories.ts` で一元管理しています。
新しいカテゴリーの追加は、主にこのファイルを編集するだけで完了します。

## カテゴリー追加手順

### 1. カテゴリーマスタに追加

`src/lib/categories.ts` の `CATEGORIES` オブジェクトに新しいエントリを追加：

```typescript
// 例：「交換」カテゴリーを追加
exchange: {
  label: '🔄 交換',
  icon: '🔄',
  color: 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-2 border-teal-800 shadow-md',
  order: 11,
  description: '物品の交換'
}
```

### 2. データベース制約更新

`sql/update-category-constraint.sql` を編集して実行：

```sql
CHECK (category IN (
  'real_estate', 'job', 'secondhand', 'agriculture', 
  'event', 'volunteer', 'question', 'info', 
  'announcement', 'other',
  'exchange'  -- ← 新しいカテゴリーを追加
));
```

### 3. バッジ色の追加（必要に応じて）

`src/app/page.tsx` の `getCategoryBadgeColor` 関数に色を追加：

```typescript
case 'exchange': return 'bg-teal-100 text-teal-700'
```

## ファイル構成

- **`src/lib/categories.ts`** - カテゴリーマスタ（メイン）
- **`src/app/page.tsx`** - メインページ（フィルター、表示）
- **`src/app/post/[id]/edit/page.tsx`** - 編集フォーム
- **`src/components/MobileMenu.tsx`** - モバイルメニュー
- **`sql/update-category-constraint.sql`** - DB制約更新用

## 注意事項

- 既存データがある場合は、データ移行SQLも必要
- `order` は表示順序（小さい順）
- `label` にはアイコン絵文字を含める
- `color` はボタン用のTailwind CSSクラス（濃い色）
- バッジ色は軽い色バリエーションを使用

## 設計思想

- **テーブル不要**: マスタテーブルを作らず、コードで管理
- **型安全**: TypeScriptで型チェック
- **拡張容易**: JSONライクな追加方法
- **保守性**: 一箇所変更で全体に反映