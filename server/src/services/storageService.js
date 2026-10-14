import crypto from 'crypto';
import { bucket } from '../config/firebase.js';

export class StorageService {
  /**
   * Upload an image file to the `temp/` folder in Firebase Storage
   * Returns temporary public URL and storage path.
   */
  static async uploadToTemp(file) {
    if (!bucket) {
      throw new Error('Firebase Storage bucket is not initialized');
    }

    if (!file || !file.buffer) {
      throw new Error('No image file provided');
    }

    const fileExtension = file.originalname ? file.originalname.split('.').pop().toLowerCase() : 'png';
    const fileName = `temp/temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const fileRef = bucket.file(fileName);
    const downloadToken = crypto.randomUUID();

    // Save buffer without using legacy ACLs to support Uniform Bucket-Level Access
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype || 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      }
    });

    const encodedPath = encodeURIComponent(fileName);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return {
      imageUrl: publicUrl,
      storagePath: fileName
    };
  }

  /**
   * Upload product media (image or video) directly to `products/` in Firebase Storage.
   * Returns permanent public URL and storage path.
   */
  static async uploadProductMedia(file) {
    if (!bucket) {
      throw new Error('Firebase Storage bucket is not initialized');
    }

    if (!file || !file.buffer) {
      throw new Error('No media file provided');
    }

    const fileExtension = file.originalname ? file.originalname.split('.').pop().toLowerCase() : 'webp';
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const fileRef = bucket.file(fileName);
    const downloadToken = crypto.randomUUID();

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype || 'image/webp',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      }
    });

    const encodedPath = encodeURIComponent(fileName);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return {
      url: publicUrl,
      storagePath: fileName
    };
  }

  /**
   * Uploads a base64 encoded media string directly to Firebase Storage.
   * Converts base64 buffer into a permanent storage file and returns the public media URL.
   * If input is not base64 or if upload fails, returns original string safely.
   */
  static async uploadBase64(base64String, folder = 'products') {
    if (!base64String || typeof base64String !== 'string') {
      return base64String || '';
    }

    const trimmed = base64String.trim();
    if (!trimmed.startsWith('data:') || !trimmed.includes(';base64,')) {
      return base64String;
    }

    if (!bucket) {
      console.warn('StorageService.uploadBase64 warning: bucket is not initialized, keeping original string');
      return base64String;
    }

    try {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx === -1) return base64String;

      const header = trimmed.substring(0, commaIdx);
      const base64Data = trimmed.substring(commaIdx + 1);

      let mimeType = 'image/jpeg';
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch && mimeMatch[1]) {
        mimeType = mimeMatch[1].trim();
      }

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length === 0) {
        return base64String;
      }

      let extension = 'jpg';
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('webp')) extension = 'webp';
      else if (mimeType.includes('gif')) extension = 'gif';
      else if (mimeType.includes('svg')) extension = 'svg';
      else if (mimeType.includes('mp4') || mimeType.includes('video')) extension = 'mp4';

      const fileName = `${folder}/migrated_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const fileRef = bucket.file(fileName);
      const downloadToken = crypto.randomUUID();

      await fileRef.save(buffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken
          }
        }
      });

      const encodedPath = encodeURIComponent(fileName);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
      console.log(`✅ Converted legacy base64 media to Firebase Storage: ${fileName}`);
      return publicUrl;
    } catch (err) {
      console.error('Failed to upload base64 to Firebase Storage:', err.message);
      return base64String;
    }
  }

  /**
   * Check if a URL or path points to a temp file and move it to the target folder (e.g., 'categories').
   * If not temp, returns the original URL unchanged.
   */
  static async moveFromTemp(imageUrlOrPath, targetFolder = 'categories', filePrefix = 'img') {
    if (!imageUrlOrPath || typeof imageUrlOrPath !== 'string') {
      return imageUrlOrPath || '';
    }

    if (!bucket) {
      console.warn('StorageService.moveFromTemp warning: bucket is not initialized');
      return imageUrlOrPath;
    }

    // Determine storage path from URL or direct path string
    let sourceStoragePath = '';
    if (imageUrlOrPath.includes('/o/')) {
      const match = imageUrlOrPath.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        sourceStoragePath = decodeURIComponent(match[1]);
      }
    } else if (imageUrlOrPath.startsWith('temp/')) {
      sourceStoragePath = imageUrlOrPath;
    }

    // If it's not in the temp/ folder, return the original URL as-is
    if (!sourceStoragePath || !sourceStoragePath.startsWith('temp/')) {
      return imageUrlOrPath;
    }

    try {
      const tempFileRef = bucket.file(sourceStoragePath);
      const [exists] = await tempFileRef.exists();
      if (!exists) {
        return imageUrlOrPath;
      }

      // Generate destination filename
      const extension = sourceStoragePath.split('.').pop() || 'png';
      const destFileName = `${targetFolder}/${filePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const destFileRef = bucket.file(destFileName);

      // Copy temp file to destination path
      await tempFileRef.copy(destFileRef);

      // Set download token metadata on destination file
      const newDownloadToken = crypto.randomUUID();
      await destFileRef.setMetadata({
        metadata: {
          firebaseStorageDownloadTokens: newDownloadToken
        }
      });

      // Delete the original temp file
      try {
        await tempFileRef.delete();
      } catch (delErr) {
        console.warn('Warning: Failed to delete temp file after copy:', delErr.message);
      }

      // Return new permanent Firebase Storage Media URL
      const encodedDestPath = encodeURIComponent(destFileName);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedDestPath}?alt=media&token=${newDownloadToken}`;
    } catch (error) {
      console.error('Error moving file from temp:', error);
      return imageUrlOrPath;
    }
  }

  /**
   * Delete files from `temp/` folder older than maxAgeHours (default 24h)
   */
  static async cleanTempFolder(maxAgeHours = 24) {
    if (!bucket) {
      throw new Error('Firebase Storage bucket is not initialized');
    }

    const [files] = await bucket.getFiles({ prefix: 'temp/' });
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      if (file.name === 'temp/' || file.name === 'temp') continue;
      try {
        const [metadata] = await file.getMetadata();
        const createdTime = new Date(metadata.timeCreated).getTime();
        if (now - createdTime > maxAgeMs) {
          await file.delete();
          deletedCount++;
        }
      } catch (err) {
        console.warn(`Failed to clean temp file ${file.name}:`, err.message);
      }
    }

    return { success: true, deletedCount };
  }

  /**
   * Delete a file from Firebase Storage bucket using its public URL or storage path
   */
  static async deleteFileFromStorage(imageUrlOrPath) {
    if (!imageUrlOrPath || typeof imageUrlOrPath !== 'string') return;
    if (!bucket) return;

    let storagePath = '';
    if (imageUrlOrPath.includes('/o/')) {
      const match = imageUrlOrPath.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        storagePath = decodeURIComponent(match[1]);
      }
    } else if (bucket.name && imageUrlOrPath.includes(`/${bucket.name}/`)) {
      const parts = imageUrlOrPath.split(`/${bucket.name}/`);
      if (parts[1]) {
        storagePath = parts[1];
      }
    } else if (!imageUrlOrPath.startsWith('http://') && !imageUrlOrPath.startsWith('https://')) {
      storagePath = imageUrlOrPath;
    }

    if (!storagePath) return;

    try {
      const fileRef = bucket.file(storagePath);
      const [exists] = await fileRef.exists();
      if (exists) {
        await fileRef.delete();
        console.log(`✅ Storage file deleted: ${storagePath}`);
      }
    } catch (err) {
      console.warn(`Warning: Failed to delete storage file (${storagePath}):`, err.message);
    }
  }
}
