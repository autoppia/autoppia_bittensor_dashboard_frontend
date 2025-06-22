/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  async redirects() {
    return [
      {
        source: "/agents",
        destination: "/agents/subnet36-top",
        permanent: true,
      },
    ];
  },
};
