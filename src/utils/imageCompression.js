/**
 * Compresses an uploaded image file client-side via HTML5 Canvas so it fits safely in localStorage.
 * @param {File} file
 * @param {number} [maxWidth]
 * @param {number} [quality]
 * @returns {Promise<string>}
 */
export function compressImageFile(file, maxWidth = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('INVALID_IMAGE_TYPE'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('INVALID_FILE_DATA'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('CANVAS_UNAVAILABLE'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
