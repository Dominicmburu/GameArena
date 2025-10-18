import * as crypto from 'crypto';
import * as fs from 'fs';

/**
 * Generate security credential for B2C and other API requests
 * Encrypts the initiator password with M-Pesa's public certificate
 */
export function generateSecurityCredential(initiatorPassword, certPath) {
  try {
    // Read the certificate file
    const certificateBuffer = fs.readFileSync(certPath);
    
    // Encrypt the password
    const encryptedPassword = crypto.publicEncrypt(
      {
        key: certificateBuffer,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(initiatorPassword)
    );
    
    // Return base64 encoded string
    return encryptedPassword.toString('base64');
  } catch (error) {
    console.error('Error generating security credential:', error);
    throw new Error('Failed to generate security credential');
  }
}

/**
 * Validate M-Pesa certificate
 */
export function validateCertificate(certPath) {
  try {
    if (!fs.existsSync(certPath)) {
      return {
        isValid: false,
        error: 'Certificate file not found at: ' + certPath
      };
    }

    const cert = fs.readFileSync(certPath, 'utf8');
    
    // Basic validation
    if (!cert.includes('BEGIN CERTIFICATE') || !cert.includes('END CERTIFICATE')) {
      return {
        isValid: false,
        error: 'Invalid certificate format'
      };
    }

    return {
      isValid: true,
      info: {
        keyType: 'RSA',
        keySize: 2048
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Format phone number to required format (254XXXXXXXXX)
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove any non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');

  // Remove leading + if present
  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

  // Handle different formats
  if (digits.startsWith('254')) {
    // Already in correct format
    digits = digits;
  } else if (digits.startsWith('0')) {
    // Convert 07XX to 2547XX
    digits = '254' + digits.substring(1);
  } else if (digits.startsWith('7') || digits.startsWith('1')) {
    // Convert 7XX to 2547XX
    digits = '254' + digits;
  } else {
    throw new Error('Invalid phone number format. Use format: 254XXXXXXXXX, 07XXXXXXXX, or 7XXXXXXXX');
  }

  // Validate length (should be 12 digits: 254XXXXXXXXX)
  if (digits.length !== 12) {
    throw new Error('Invalid phone number length. Kenyan numbers should have 9 digits after country code.');
  }

  // Validate it's a valid Kenyan mobile number (starts with 254 7XX or 254 1XX)
  const validPrefixes = ['2547', '2541']; // Safaricom, Airtel
  const hasValidPrefix = validPrefixes.some(prefix => digits.startsWith(prefix));
  
  if (!hasValidPrefix) {
    throw new Error('Invalid Kenyan mobile number. Must start with 07XX or 01XX');
  }

  return digits;
}

/**
 * Generate timestamp for M-Pesa in format: YYYYMMDDHHmmss
 */
export function generateTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Generate M-Pesa password for STK Push
 */
export function generatePassword(businessShortCode, passkey, timestamp) {
  const str = businessShortCode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
}

/**
 * Validate M-Pesa amount
 */
export function validateAmount(amount, type = 'DEPOSIT') {
  const numAmount = Number(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // M-Pesa limits
  const MIN_AMOUNT = 1;
  const MAX_STK_AMOUNT = 150000; // KES 150,000
  const MAX_B2C_AMOUNT = 70000;  // KES 70,000 per transaction

  if (numAmount < MIN_AMOUNT) {
    throw new Error(`Minimum amount is KES ${MIN_AMOUNT}`);
  }

  if (type === 'DEPOSIT' && numAmount > MAX_STK_AMOUNT) {
    throw new Error(`Maximum deposit amount is KES ${MAX_STK_AMOUNT}`);
  }

  if (type === 'WITHDRAWAL' && numAmount > MAX_B2C_AMOUNT) {
    throw new Error(`Maximum withdrawal amount is KES ${MAX_B2C_AMOUNT}`);
  }

  return Math.round(numAmount); // M-Pesa doesn't support decimals
}

/**
 * Generate unique reference for transactions
 */
export function generateReference(prefix = 'TXN') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Parse M-Pesa callback metadata
 */
export function parseCallbackMetadata(items) {
  if (!Array.isArray(items)) return {};
  
  const metadata = {};
  items.forEach(item => {
    if (item.Name && item.Value !== undefined) {
      metadata[item.Name] = item.Value;
    }
  });
  
  return metadata;
}

/**
 * Check if transaction is still pending (within timeout)
 */
export function isTransactionTimedOut(createdAt, timeoutMinutes = 5) {
  const createdTime = new Date(createdAt).getTime();
  const currentTime = Date.now();
  const diffMinutes = (currentTime - createdTime) / (1000 * 60);
  
  return diffMinutes > timeoutMinutes;
}

/**
 * Sanitize M-Pesa error messages for user display
 */
export function sanitizeErrorMessage(error) {
  const errorMap = {
    'DS timeout': 'Request timeout. Please try again.',
    'insufficient funds': 'Insufficient funds in your M-Pesa account.',
    'invalid phone': 'Invalid phone number.',
    'user canceled': 'Transaction was cancelled.',
    'The initiator information is invalid': 'Payment system configuration error. Please contact support.',
    'The balance is insufficient': 'Insufficient funds.',
    'Request cancelled by user': 'You cancelled the transaction.',
    'The service request is processed successfully': 'Transaction successful.',
    'invalid access token': 'Authentication failed. Please try again.',
    'Bad Request - Invalid': 'Invalid request. Please check your details.',
  };

  const message = error?.message || error?.errorMessage || String(error);
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'An error occurred. Please try again or contact support.';
}

/**
 * Validate Kenyan phone number format
 */
export function isValidKenyanPhone(phone) {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Check various formats
  const patterns = [
    /^254[71]\d{8}$/,     // 254712345678
    /^0[71]\d{8}$/,       // 0712345678
    /^[71]\d{8}$/,        // 712345678
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format amount for display
 */
export function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate M-Pesa transaction charges (approximate)
 * Note: These are estimated charges and may vary
 */
export function calculateMpesaCharges(amount) {
  // Simplified charge structure
  if (amount <= 100) return 0;
  if (amount <= 500) return 7;
  if (amount <= 1000) return 13;
  if (amount <= 1500) return 23;
  if (amount <= 2500) return 33;
  if (amount <= 3500) return 53;
  if (amount <= 5000) return 57;
  if (amount <= 7500) return 78;
  if (amount <= 10000) return 90;
  if (amount <= 15000) return 100;
  if (amount <= 20000) return 105;
  if (amount <= 35000) return 108;
  if (amount <= 50000) return 110;
  if (amount <= 70000) return 110;
  
  return 110; // Max charge
}

/**
 * Mask phone number for display (e.g., 254712***678)
 */
export function maskPhoneNumber(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) return phone;
  
  // Show first 6 and last 3 digits
  const visible = cleaned.substring(0, 6) + '***' + cleaned.substring(cleaned.length - 3);
  return visible;
}

/**
 * Validate M-Pesa receipt number format
 */
export function isValidMpesaReceipt(receipt) {
  if (!receipt) return false;
  
  // M-Pesa receipt format: Usually starts with letters followed by numbers
  // Example: QGJ12345678
  const pattern = /^[A-Z]{2,3}\d{8,10}$/i;
  return pattern.test(receipt);
}

/**
 * Get M-Pesa error code description
 */
export function getMpesaErrorDescription(code) {
  const errorCodes = {
    '0': 'Success',
    '1': 'Insufficient Funds',
    '2': 'Less Than Minimum Transaction Value',
    '3': 'More Than Maximum Transaction Value',
    '4': 'Would Exceed Daily Transfer Limit',
    '5': 'Would Exceed Minimum Balance',
    '6': 'Unresolved Primary Party',
    '7': 'Unresolved Receiver Party',
    '8': 'Would Exceed Maximum Balance',
    '11': 'Debit Account Invalid',
    '12': 'Credit Account Invalid',
    '13': 'Unresolved Debit Account',
    '14': 'Unresolved Credit Account',
    '15': 'Duplicate Detected',
    '17': 'Internal Failure',
    '20': 'Unresolved Initiator',
    '26': 'Traffic Blocking Condition In Place',
    '1032': 'Request cancelled by user',
    '1037': 'Timeout User cannot be reached',
    '2001': 'Wrong PIN entered',
    '1': 'The balance is insufficient for the transaction',
    '1019': 'Transaction expired. No MO has been received',
  };
  
  return errorCodes[String(code)] || `Error code: ${code}`;
}