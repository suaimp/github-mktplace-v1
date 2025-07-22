/**
 * Typography styles for MarketplaceTable
 * This file centralizes all text styling to maintain consistency and single responsibility
 */

// Base text size for all table text elements (8px)
export const TABLE_TEXT_SIZE = 'text-[8px]';

// Typography classes for different table elements
export const TABLE_TYPOGRAPHY = {
  // Headers (th elements)
  header: `${TABLE_TEXT_SIZE} font-semibold leading-tight`,
  
  // Cell content (td elements)
  cell: `${TABLE_TEXT_SIZE} leading-tight`,
  
  // Links and anchors
  link: `${TABLE_TEXT_SIZE} font-semibold leading-tight`,
  
  // Brand/logo text
  brand: `${TABLE_TEXT_SIZE} font-medium leading-tight`,
  
  // Country labels
  country: `${TABLE_TEXT_SIZE} font-medium leading-tight`,
  
  // Niche labels
  niche: `${TABLE_TEXT_SIZE} leading-tight`,
  
  // Price text
  price: `${TABLE_TEXT_SIZE} leading-tight`,
  
  // Button text
  button: `${TABLE_TEXT_SIZE} font-medium leading-tight`,
  
  // Pagination text
  pagination: `${TABLE_TEXT_SIZE} font-medium leading-tight`,
  
  // Controls text (search, entries per page)
  controls: `${TABLE_TEXT_SIZE} leading-tight`,
  
  // Multiselect tags
  tag: `${TABLE_TEXT_SIZE} font-medium leading-tight`,
} as const;

// Helper function to get typography class
export function getTableTextClass(type: keyof typeof TABLE_TYPOGRAPHY): string {
  return TABLE_TYPOGRAPHY[type];
}

// Helper function to combine typography with other classes
export function combineWithTableText(
  type: keyof typeof TABLE_TYPOGRAPHY, 
  additionalClasses: string = ''
): string {
  return `${TABLE_TYPOGRAPHY[type]} ${additionalClasses}`.trim();
}
