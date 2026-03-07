import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Derive the hostname from the Supabase URL for CSP connect-src
function supabaseHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

const cspDirectives = [
  "default-src 'self'",
  // Allow Next.js inline scripts and eval (required for dev HMR; tighten with nonces in production)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // Allow connections to Supabase for auth and realtime
  `connect-src 'self' ${supabaseUrl} wss://${supabaseHost(supabaseUrl)}`,
  // Allow images from same origin, data URIs, and blob URLs (for exports)
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  // Prevent embedding in frames on any other origin
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // Enforce HTTPS for 2 years, including subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Limit referrer info sent to third parties
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disable browser features not used by this app
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // DNS prefetch opt-in for performance without leaking navigation intent
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
