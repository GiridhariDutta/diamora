/**
 * Browser CacheStorage Utility for 3D GLB Models
 * Ensures GLB files are cached locally in the browser so they load instantly (0ms)
 * on return visits without making network requests.
 */
const CACHE_NAME = 'diamora-3d-models-v1';

export class GLBCacheManager {
  /**
   * Fetch a GLB model with CacheStorage caching.
   * Returns a local Blob Object URL for Three.js GLTFLoader.
   * @param {string} url - Remote GLB file URL
   * @returns {Promise<string>} - Local Blob URL or fallback URL
   */
  static async getCachedGlbUrl(url) {
    if (!url) return url;

    // For local bundled assets (e.g. /src/assets/models/...), return directly with zero delay
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }

    // If CacheStorage API is not supported in current environment
    if (typeof window === 'undefined' || !('caches' in window)) {
      return url;
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        // Returned from browser CacheStorage instantly (0ms network request)
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }

      // Fetch from network if not already cached
      const response = await fetch(url);
      if (response.ok) {
        // Save clone in CacheStorage asynchronously
        cache.put(url, response.clone()).catch(err => {
          console.warn('CacheStorage save warning:', err.message);
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (err) {
      console.warn('GLBCacheManager warning, using direct URL fallback:', err.message);
    }

    return url;
  }
}
