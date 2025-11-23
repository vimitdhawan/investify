import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    domains: [
      "storage.googleapis.com",
      "firebasestorage.googleapis.com", // ← Add this
    ],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
