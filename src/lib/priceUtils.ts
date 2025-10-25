/**
 * Calculate discounted price based on original price and discount percentage
 * @param price - Original price
 * @param discountPercentage - Discount percentage (0-100)
 * @returns Discounted price
 */
export const calculateDiscountedPrice = (price: number, discountPercentage: number = 0): number => {
  if (!discountPercentage || discountPercentage <= 0) {
    return price;
  }
  
  const discount = (price * discountPercentage) / 100;
  return price - discount;
};

/**
 * Get the effective price (discounted if discount exists, otherwise original)
 * @param price - Original price
 * @param discount - Discount percentage
 * @returns Effective price to use
 */
export const getEffectivePrice = (price: number, discount?: number): number => {
  return discount && discount > 0 ? calculateDiscountedPrice(price, discount) : price;
};

/**
 * Format price for display with currency symbol
 * @param price - Price to format
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = '₹'): string => {
  return `${currency}${price.toFixed(2)}`;
};

/**
 * Calculate savings amount
 * @param originalPrice - Original price
 * @param discountPercentage - Discount percentage
 * @returns Savings amount
 */
export const calculateSavings = (originalPrice: number, discountPercentage: number): number => {
  return (originalPrice * discountPercentage) / 100;
};
