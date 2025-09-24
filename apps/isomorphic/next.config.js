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
        source: "/runs",
        destination: "/runs/current",
        permanent: true,
      },
      {
        source: "/agents",
        destination: "/agents/subnet36-top",
        permanent: true,
      },
    ];
  },
};
