const blockedProviders = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'aol.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'protonmail.com',
  'tutanota.com',
  'mail.com',
  'yandex.com',
  'zoho.com',
  'fastmail.com',
  'hushmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.org',
  'mailinator.com',
  'throwaway.email'
];

/**
 * Extract domain from a URL
 * @param {string} url - The URL to extract domain from
 * @returns {string|null} - The domain or null if invalid
 */
const extractDomainFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch (error) {
    return null;
  }
};

/**
 * Extract domain from an email address
 * @param {string} email - The email address
 * @returns {string|null} - The domain or null if invalid
 */
const extractDomainFromEmail = (email) => {
  if (!email || typeof email !== 'string') return null;

  const emailRegex = /^[^\s@]+@([^\s@]+)$/;
  const match = email.match(emailRegex);

  if (match) {
    return match[1].toLowerCase();
  }

  return null;
};

/**
 * Check if an email domain is blocked
 * @param {string} email - The email address to check
 * @returns {boolean} - True if blocked, false otherwise
 */
const isEmailDomainBlocked = (email) => {
  const domain = extractDomainFromEmail(email);
  if (!domain) return true; // Invalid email is considered blocked

  return blockedProviders.includes(domain);
};

/**
 * Check if email domain matches website domain
 * @param {string} email - The email address
 * @param {string} website - The website URL
 * @returns {boolean} - True if domains match, false otherwise
 */
const doDomainsMatch = (email, website) => {
  const emailDomain = extractDomainFromEmail(email);
  const websiteDomain = extractDomainFromUrl(website);

  if (!emailDomain || !websiteDomain) return false;

  // Remove 'www.' prefix for comparison
  const cleanEmailDomain = emailDomain.replace(/^www\./, '');
  const cleanWebsiteDomain = websiteDomain.replace(/^www\./, '');

  return cleanEmailDomain === cleanWebsiteDomain;
};

/**
 * Validate company contact email against website domain
 * @param {string} email - The contact email
 * @param {string} website - The company website
 * @returns {object} - Validation result with isValid and message
 */
const validateCompanyEmail = (email, website) => {
  // Check if email is provided
  if (!email || email.trim() === '') {
    return {
      isValid: true,
      message: null
    };
  }

  // Check if email is valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }

  // Check if email domain is blocked
  if (isEmailDomainBlocked(email)) {
    return {
      isValid: false,
      message: 'Personal email providers (Gmail, Hotmail, etc.) are not allowed. Please use a company email address.'
    };
  }

  // If website is provided, check domain matching
  if (website && website.trim() !== '') {
    if (!doDomainsMatch(email, website)) {
      return {
        isValid: false,
        message: 'Email domain must match the company website domain'
      };
    }
  }

  return {
    isValid: true,
    message: null
  };
};

export {
  blockedProviders,
  extractDomainFromUrl,
  extractDomainFromEmail,
  isEmailDomainBlocked,
  doDomainsMatch,
  validateCompanyEmail
};
