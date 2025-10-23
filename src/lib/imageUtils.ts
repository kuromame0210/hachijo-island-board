/**
 * Supabase Storage の画像URLを変換APIを使ってリサイズする
 *
 * @param url 元の画像URL
 * @param width リサイズ後の幅（px）
 * @param quality 画質（1-100、デフォルト75）
 * @returns 変換後のURL
 */
export function getResizedImageUrl(
  url: string | null | undefined,
  width: number,
  quality: number = 75
): string {
  if (!url) return '';

  // Supabase Storage のURLでない場合はそのまま返す
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  // URLを変換APIのエンドポイントに変更
  // 元: https://xxx.supabase.co/storage/v1/object/public/bucket/path.jpg
  // 変換後: https://xxx.supabase.co/storage/v1/render/image/public/bucket/path.jpg?width=128&quality=75
  const transformedUrl = url
    .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    + `?width=${width}&quality=${quality}`;

  return transformedUrl;
}

/**
 * 一覧表示用の小さい画像URLを取得（128px）
 */
export function getThumbnailUrl(url: string | null | undefined): string {
  return getResizedImageUrl(url, 128, 75);
}

/**
 * カード表示用の中サイズ画像URLを取得（640px）
 */
export function getCardImageUrl(url: string | null | undefined): string {
  return getResizedImageUrl(url, 640, 80);
}

/**
 * 詳細表示用の大きい画像URLを取得（1920px）
 */
export function getDetailImageUrl(url: string | null | undefined): string {
  return getResizedImageUrl(url, 1920, 85);
}
