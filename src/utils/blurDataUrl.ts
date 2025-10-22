// ベースとなるぼかし画像のData URL
export const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sx14KZpshGLvDGK2ghgnyEkXASQLktn4B6D2H9RzPQAZmYOoJGaW5WNZYV8nz8A4AJkHFy6jXcnZg6jhz9fT6AA8VoAACoAANPgAAA9vKAD/2Q=='

// プレースホルダー用の小さなぼかし画像
export const SMALL_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjFmNWY5Ii8+Cjwvc3ZnPgo='

// 動的なぼかし画像を生成する関数
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // グラデーションを作成
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f1f5f9');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// カテゴリー別のぼかし色を生成
export const getCategoryBlurColor = (category: string): string => {
  const colors: Record<string, string> = {
    'real_estate': '#dbeafe',
    'job': '#dcfce7',
    'secondhand': '#fed7aa',
    'agriculture': '#dcfce7',
    'event': '#e879f9',
    'volunteer': '#fce7f3',
    'question': '#c7d2fe',
    'info': '#fef3c7',
    'announcement': '#fecaca',
    'other': '#f1f5f9',
    'advertisement': '#fef3c7'
  };
  
  return colors[category] || '#f1f5f9';
};