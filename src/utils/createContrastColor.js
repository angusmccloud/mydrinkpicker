import { calculateContrastRatio } from './colorContrast';

/**
 * Creates a contrast color that has a ratio of 7.0 with the given hex color code.
 * 
 * @param {string} hex - The hex color code.
 * @returns {string} - The hex color code of the contrast color.
 */
function createContrastColor(hex) {
  const luminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const targetContrastRatio = 7.0;
  let contrastColor = '#000000';
  let minDifference = Infinity;

  for (let r = 0; r <= 255; r++) {
    for (let g = 0; g <= 255; g++) {
      for (let b = 0; b <= 255; b++) {
        const testColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        const contrastRatio = calculateContrastRatio(hex, testColor);
        const difference = Math.abs(contrastRatio - targetContrastRatio);

        if (difference < minDifference) {
          minDifference = difference;
          contrastColor = testColor;
        }
      }
    }
  }

  return contrastColor;
}

export { createContrastColor };
