// Environment variable validation and type-safe access
// TODO: Add runtime validation using zod or similar

type EnvConfig = {
  DATABASE_URL: string | undefined;
  RESEND_API_KEY: string | undefined;
  NEXT_PUBLIC_APP_URL: string | undefined;
};

function getEnv(): EnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
}

export const env = getEnv();

// Helper to validate required env vars at runtime
export function validateEnv() {
  const required = ['DATABASE_URL', 'RESEND_API_KEY'] as const;
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
