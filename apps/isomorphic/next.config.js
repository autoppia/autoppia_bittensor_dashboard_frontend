/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/land",
        permanent: true,
      },
      {
        source: "/rounds",
        destination: "/rounds/current",
        permanent: true,
      },
      {
        source: "/agents",
        destination: "/agents/1",
        permanent: true,
      },
    ];
  },
};
