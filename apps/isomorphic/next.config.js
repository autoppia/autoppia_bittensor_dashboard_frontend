/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
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
