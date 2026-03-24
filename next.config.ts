import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.kiloapps.io",
        pathname: "/user_dd4037cd-bc12-4818-a841-664202163b63/**",
      },
    ],
  },
};

export default nextConfig;