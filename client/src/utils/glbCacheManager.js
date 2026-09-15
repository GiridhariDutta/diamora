/**
 * Browser CacheStorage & Memory Blob Utility for 3D GLB Models
 * Ensures remote Firebase CDN GLB files are cached locally in browser memory & CacheStorage,
 * keeping the frontend JS bundle ultra-lightweight while guaranteeing 0ms instant loading
 * when navigating between pages.
 */
const CACHE_NAME = 'diamora-3d-models-v1';
const memoryBlobMap = new Map();

export class GLBCacheManager {
  /**
   * Fetch a GLB model with CacheStorage & Memory Blob caching.
   * Returns a local Blob Object URL for Three.js GLTFLoader.
   * @param {string} url - Remote GLB file URL (Firebase CDN)
   * @returns {Promise<string>} - Local Blob URL or fallback URL
   */
  static async getCachedGlbUrl(url) {
    if (!url) return url;

    // 1. Check in-memory Blob URL Map (0ms Instant Return on Page Navigation)
    if (memoryBlobMap.has(url)) {
      return memoryBlobMap.get(url);
    }

    // For local non-HTTP URLs, return directly
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }

    if (typeof window === 'undefined' || !('caches' in window)) {
      return url;
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        // Returned from browser CacheStorage instantly (0ms network request)
        const blob = await cachedResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        memoryBlobMap.set(url, blobUrl);
        return blobUrl;
      }

      // Fetch from Firebase CDN if not already cached
      const response = await fetch(url);
      if (response.ok) {
        // Save clone in CacheStorage asynchronously
        cache.put(url, response.clone()).catch(err => {
          console.warn('CacheStorage save warning:', err.message);
        });
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        memoryBlobMap.set(url, blobUrl);
        return blobUrl;
      }
    } catch (err) {
      console.warn('GLBCacheManager warning, using direct URL fallback:', err.message);
    }

    return url;
  }
}
