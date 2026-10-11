import type { NextConfig } from "next"

const config: NextConfig = {
  transpilePackages: ["@easyuse-ui/ui"],
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "101.6.43.243"],
}

export default config
