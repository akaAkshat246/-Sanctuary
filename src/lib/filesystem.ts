import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const NativeFiles = {
  // Save base64 / blob to on-device storage
  async saveFile(fileName: string, base64Data: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      // In web browser, dataUrl is used directly
      return base64Data;
    }

    try {
      // Extract pure base64 if prefixed with data:
      const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const result = await Filesystem.writeFile({
        path: `sanctuary_vault/${safeName}`,
        data: cleanData,
        directory: Directory.Data,
        recursive: true,
      });

      return result.uri;
    } catch (error) {
      console.error('Error saving file to native storage:', error);
      return base64Data;
    }
  },

  // Get displayable URL for an on-device file
  getDisplayUrl(uri: string): string {
    if (!uri) return '';
    if (uri.startsWith('data:') || uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('blob:')) {
      return uri;
    }
    return Capacitor.convertFileSrc(uri);
  },

  // Delete file from device
  async deleteFile(uri: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      // If it's a file:// uri, extract path
      await Filesystem.deleteFile({
        path: uri,
      });
      return true;
    } catch (error) {
      console.warn('Could not delete native file from filesystem:', error);
      return false;
    }
  },

  // Storage check estimate
  async getStorageEstimate(): Promise<{ usedBytes: number; availableBytes?: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usedBytes: estimate.usage || 0,
          availableBytes: estimate.quota || 15 * 1024 * 1024 * 1024, // 15 GB estimate on device
        };
      } catch {
        return { usedBytes: 0 };
      }
    }
    return { usedBytes: 0 };
  }
};
