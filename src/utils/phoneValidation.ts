/**
 * Validates Brazilian phone number formats
 * Accepts formats like:
 * - (11) 99999-9999
 * - 11999999999
 * - +55 11 99999-9999
 * - +5511999999999
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim() === "") {
    return false;
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Check Brazilian phone patterns:
  // - 11 digits: DDD + 9 + 8 digits (mobile)
  // - 10 digits: DDD + 8 digits (landline)
  // - 13 digits: +55 + DDD + 9 + 8 digits (international mobile)
  // - 12 digits: +55 + DDD + 8 digits (international landline)

  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    // Local format
    return true;
  }

  if (digitsOnly.length === 12 || digitsOnly.length === 13) {
    // International format - must start with 55 (Brazil country code)
    return digitsOnly.startsWith("55");
  }

  return false;
};

/**
 * Formats phone number for display
 */
export const formatPhone = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length === 11) {
    // (XX) 9XXXX-XXXX
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(
      2,
      7
    )}-${digitsOnly.slice(7)}`;
  }

  if (digitsOnly.length === 10) {
    // (XX) XXXX-XXXX
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(
      2,
      6
    )}-${digitsOnly.slice(6)}`;
  }

  return phone; // Return as-is if doesn't match expected patterns
};
