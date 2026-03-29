import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@studywithme/design-tokens",
    "@studywithme/domain",
    "@studywithme/supabase",
  ],
};

export default nextConfig;
