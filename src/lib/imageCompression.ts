import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  preserveExif: boolean;
  onProgress?: (progress: number) => void;
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,           // 1MB以下に圧縮
  maxWidthOrHeight: 1920, // 最大解像度1920px
  useWebWorker: true,     // バックグラウンド処理
  preserveExif: false     // EXIF削除でサイズ削減
};

export const compressImage = async (
  file: File, 
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<File> => {
  try {
    console.log(`画像圧縮開始: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    const compressedFile = await imageCompression(file, options);
    
    const originalSizeMB = file.size / 1024 / 1024;
    const compressedSizeMB = compressedFile.size / 1024 / 1024;
    const compressionRatio = ((originalSizeMB - compressedSizeMB) / originalSizeMB * 100).toFixed(1);
    
    console.log(`圧縮完了: ${file.name}`);
    console.log(`  元サイズ: ${originalSizeMB.toFixed(2)}MB`);
    console.log(`  圧縮後: ${compressedSizeMB.toFixed(2)}MB`);
    console.log(`  削減率: ${compressionRatio}%`);
    
    return compressedFile;
  } catch (error) {
    console.error('画像圧縮エラー:', error);
    throw new Error(`画像の圧縮に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS,
  onProgress?: (completed: number, total: number) => void
): Promise<File[]> => {
  const compressedFiles: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options);
      compressedFiles.push(compressedFile);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`画像 ${files[i].name} の圧縮に失敗:`, error);
      throw error;
    }
  }
  
  return compressedFiles;
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };
    
    img.src = url;
  });
};