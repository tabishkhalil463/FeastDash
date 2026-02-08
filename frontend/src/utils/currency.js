export function formatPrice(amount) {
  const num = Number(amount);
  if (isNaN(num)) return 'Rs. 0';
  return `Rs. ${num.toLocaleString('en-PK')}`;
}
