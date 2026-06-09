import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BANQUEST_SOURCE_KEY: process.env.BANQUEST_SOURCE_KEY,
    BANQUEST_PIN: process.env.BANQUEST_PIN,
    BANQUEST_ENV: process.env.BANQUEST_ENV,
  },
};

export default nextConfig;
