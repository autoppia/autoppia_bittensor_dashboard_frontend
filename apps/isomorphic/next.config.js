/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/overview",
        permanent: true,
      },
      {
        source: "/rounds",
        destination: "/rounds/current",
        permanent: true,
      },
      {
        source: "/agent-run",
        destination: "/agent-run/456872",
        permanent: true,
      },
    ];
  },
};
