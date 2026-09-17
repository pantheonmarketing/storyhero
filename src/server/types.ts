export type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS?: { fetch: typeof fetch };
  GEMINI_API_KEY?: string;
  GEMINI_TEXT_MODEL?: string;
  GEMINI_TEXT_FALLBACK_MODEL?: string;
  GEMINI_IMAGE_MODEL?: string;
  GEMINI_DAILY_IMAGE_LIMIT?: string;
  GEMINI_TTS_MODEL?: string;
  GEMINI_TTS_FALLBACK_MODEL?: string;
  IMAGE_PROVIDER?: 'gemini' | 'higgsfield' | 'kie';
  IMAGE_FALLBACK_PROVIDER?: 'higgsfield' | 'kie' | 'none';
  KIE_API_KEY?: string;
  KIE_REFERENCE_SIGNING_KEY?: string;
  KIE_IMAGE_MODEL?: string;
  KIE_IMAGE_RESOLUTION?: string;
  KIE_CREDITS_PER_IMAGE?: string;
  KIE_DAILY_CREDIT_LIMIT?: string;
  HIGGSFIELD_MCP_URL?: string;
  HIGGSFIELD_MCP_ACCESS_TOKEN?: string;
  HIGGSFIELD_TOKEN_ENCRYPTION_KEY?: string;
  HIGGSFIELD_IMAGE_MODEL?: string;
  HIGGSFIELD_CREDITS_PER_IMAGE?: string;
  HIGGSFIELD_DAILY_CREDIT_LIMIT?: string;
  OTP_IP_HOURLY_LIMIT?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  GOOGLE_CLIENT_ID?: string;
  ENVIRONMENT?: string;
  DEV_AUTH_EMAIL?: string;
};

export type AuthedUser = {
  email: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
};
