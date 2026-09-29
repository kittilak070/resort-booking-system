/**
 * Security & Privacy Utilities (OWASP SEC-02 & PDPA Compliance)
 */

/**
 * Masks Thai National ID Card (13 digits) or Passport
 * Format: 1-1002-XXXXX-01
 */
export const maskIdCard = (id: string | undefined): string => {
  if (!id) return '-';
  const clean = id.replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean[0]}-${clean.slice(1, 5)}-XXXXX-${clean.slice(11, 13)}`;
  }
  // Generic fallback masking for passports / foreign IDs
  if (id.length <= 4) return '****';
  return `${id.slice(0, 2)}****${id.slice(-2)}`;
};

/**
 * Masks Phone Number
 * Format: 081-XXX-5678
 */
export const maskPhone = (phone: string | undefined): string => {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-XXX-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-XXX-${clean.slice(5)}`;
  }
  return phone;
};

/**
 * Masks Email Address
 * Format: s***i@domain.com
 */
export const maskEmail = (email: string | undefined): string => {
  if (!email || !email.includes('@')) return email || '-';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 4))}${user.slice(-1)}@${domain}`;
};

/**
 * Thai National ID Card Modulo 11 Checksum Validation
 */
export const validateThaiIdCardChecksum = (id: string): boolean => {
  const clean = id.replace(/\D/g, '');
  if (clean.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean.charAt(i), 10) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(clean.charAt(12), 10);
};
