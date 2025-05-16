/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "isomorphic-furyroad.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  transpilePackages: ["core"],
  async redirects() {
    return [
      {
        source: "/agents",
        destination: "/agents/subnet-36-miner-6",
        permanent: true, 
      },
    ];
  },
};
