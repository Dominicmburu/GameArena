import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";

const safeCookieDomain =
  isProd &&
  process.env.COOKIE_DOMAIN &&
  !/localhost/i.test(process.env.COOKIE_DOMAIN) &&
  !/:\d+/.test(process.env.COOKIE_DOMAIN) &&
  !/^https?:\/\//i.test(process.env.COOKIE_DOMAIN)
    ? process.env.COOKIE_DOMAIN
    : undefined;

// M-Pesa environment selector (independent of NODE_ENV)
const mpesaEnv = process.env.MPESA_ENV?.toLowerCase() === "production" ? "production" : "sandbox";

// Validate required M-Pesa configs based on environment
const validateMpesaConfig = () => {
  const required = mpesaEnv === "production" 
    ? [
        'MPESA_LIVE_CONSUMER_KEY',
        'MPESA_LIVE_CONSUMER_SECRET', 
        'MPESA_LIVE_BUSINESS_SHORT_CODE',
        'MPESA_LIVE_PASSKEY',
        'MPESA_LIVE_CALLBACK_URL',
        'MPESA_INITIATOR_NAME',
        'MPESA_INITIATOR_PASSWORD',
        'MPESA_CERT_PATH'
      ]
    : [
        'MPESA_CONSUMER_KEY',
        'MPESA_CONSUMER_SECRET',
        'MPESA_BUSINESS_SHORT_CODE', 
        'MPESA_PASSKEY',
        'MPESA_CALLBACK_URL'
      ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required M-Pesa ${mpesaEnv} config:`, missing.join(', '));
    console.error(`Current MPESA_ENV: ${mpesaEnv}`);
    if (mpesaEnv === "sandbox") {
      console.warn("⚠️  Running in SANDBOX mode. Set MPESA_ENV=production for live transactions.");
    }
  }
  
  return missing.length === 0;
};

export const env = {
  port: Number(process.env.PORT) || 4000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  
  cookieDomain: safeCookieDomain,
  cookieSecure: process.env.COOKIE_SECURE === "true",

  clientOrigins: process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(",").map(o => o.trim())
    : [process.env.CLIENT_ORIGIN || "http://localhost:5173"],

  // Base API URL for callbacks
  apiBaseUrl: process.env.BACKEND_URL,

  mpesa: {
    env: mpesaEnv,
    isProduction: mpesaEnv === "production",
    isSandbox: mpesaEnv === "sandbox",
    
    // Sandbox configuration
    sandbox: {
      baseURL: "https://sandbox.safaricom.co.ke",
      consumerKey: process.env.MPESA_CONSUMER_KEY || "",
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || "",
      passkey: process.env.MPESA_PASSKEY || "",
      callbackURL: process.env.MPESA_CALLBACK_URL || "",
      queueTimeoutURL: process.env.MPESA_QUEUE_TIMEOUT_URL || "",
      resultURL: process.env.MPESA_RESULT_URL || "",
      initiatorName: process.env.MPESA_INITIATOR_NAME || "testapi",
      initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD || "Safaricom999!*!",
      securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "Safaricom999!*!",
    },
    
    // Production configuration
    production: {
      baseURL: "https://api.safaricom.co.ke",
      consumerKey: process.env.MPESA_LIVE_CONSUMER_KEY || "",
      consumerSecret: process.env.MPESA_LIVE_CONSUMER_SECRET || "",
      businessShortCode: process.env.MPESA_LIVE_BUSINESS_SHORT_CODE || "",
      passkey: process.env.MPESA_LIVE_PASSKEY || "",
      callbackURL: process.env.MPESA_LIVE_CALLBACK_URL || "",
      queueTimeoutURL: process.env.MPESA_LIVE_QUEUE_TIMEOUT_URL || "",
      resultURL: process.env.MPESA_LIVE_RESULT_URL || "",
      initiatorName: process.env.MPESA_INITIATOR_NAME || "",
      initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD || "",
      certPath: process.env.MPESA_CERT_PATH || "",
    },
  },
};

// Validate required environment variables
if (!env.dbUrl) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}

if (!env.jwtSecret) {
  console.error("❌ JWT_SECRET is required");
  process.exit(1);
}

// Validate M-Pesa configuration
const mpesaConfigValid = validateMpesaConfig();

if (!mpesaConfigValid) {
  console.warn("⚠️  M-Pesa configuration incomplete. Payment features may not work.");
}

// Log startup configuration
console.log("🚀 Environment Configuration:");
console.log(`   Node ENV: ${env.nodeEnv}`);
console.log(`   M-Pesa ENV: ${env.mpesa.env.toUpperCase()}`);
console.log(`   API Base URL: ${env.apiBaseUrl}`);
console.log(`   Database: ${env.dbUrl ? '✅ Connected' : '❌ Not configured'}`);
console.log(`   M-Pesa: ${mpesaConfigValid ? '✅ Configured' : '⚠️  Incomplete'}`);