import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.com/users/722247304660254790",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
