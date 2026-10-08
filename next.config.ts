import type { NextConfig } from "next"

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "101.6.43.243"],
}

export default config
