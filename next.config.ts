import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com'],
  },
  reactCompiler: false,

  // Mark server-only packages to exclude from client bundle
  // This is needed for packages that use Node.js APIs like worker_threads
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
};

export default nextConfig;
