import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 4000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY || "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
    businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || "",
    passkey: process.env.MPESA_PASSKEY || "",
    env: process.env.MPESA_ENV || "sandbox", 
    callbackURL: process.env.MPESA_CALLBACK_URL,               // FIXED
    queueTimeoutURL: process.env.MPESA_QUEUE_TIMEOUT_URL,     // FIXED
    resultURL: process.env.MPESA_RESULT_URL,
    initiatorName: process.env.MPESA_INITIATOR_NAME || "testapi", 
    securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "", 
    
  },
};

if (!env.dbUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

if (!env.jwtSecret) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}