/**
 * Calculates the contrast ratio between two hex color codes.
 * Follows the WCAG guidelines for contrast ratio calculation.
 * 
 * @param {string} hex1 - The first hex color code.
 * @param {string} hex2 - The second hex color code.
 * @returns {number} - The contrast ratio between the two colors.
 */
function calculateContrastRatio(hex1, hex2) {
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

  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export { calculateContrastRatio };
