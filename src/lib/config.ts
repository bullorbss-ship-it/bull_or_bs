/**
 * Centralized environment config with defaults.
 * All env var access goes through here — never read process.env directly in route files.
 */
export const envConfig = {
  // API Keys
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  scanSecret: process.env.SCAN_SECRET || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',

  // Analytics
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',

  // Runtime
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Paths
  contentDir: 'content',
  dataDir: 'data',
} as const;
