export const nth = (num) => {
  const n = num % 100;
  return num + (n >= 11 && n <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][num % 10]);
}

export const oxfordComma = (arr, conjunction, ifempty) => {
  const l = arr.length;
  if (!l) return ifempty;
  if (l < 2) return arr[0];
  if (l < 3) return arr.join(` ${conjunction} `);
  arr = arr.slice();
  arr[l - 1] = `${conjunction} ${arr[l - 1]}`;
  return arr.join(", ");
}

export const formatCurrency = (amount, decimalPlaces = 2) => {
  // Format currency with commas and X decimal places
  if(decimalPlaces > 0) {
    return "$" + amount.toFixed(decimalPlaces).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  // If decimal places is 0, simple add Comma and dollar sign
  return "$" + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}