/**
 * Convert any image file (JPEG, PNG, GIF, WEBP, etc.) to compressed WebP format in the browser
 * @param {File} file - The original uploaded image file
 * @param {number} quality - WebP compression quality (0.1 to 1.0, default 0.85)
 * @param {number} maxWidth - Maximum width constraint for downscaling large photos (default 1920px)
 * @returns {Promise<File>} - Converted and compressed .webp File object
 */
export const convertToWebP = (file, quality = 0.85, maxWidth = 1920) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a valid image.'));
    }

    // If it's already a small WebP file (< 500KB), no need to re-encode
    if (file.type === 'image/webp' && file.size < 500 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale proportionally if wider than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('WebP image conversion failed.'));
            }

            const originalBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
            const webpFileName = `${originalBaseName}.webp`;
            const webpFile = new File([blob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now()
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for WebP conversion.'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};
