/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taostats.io',
        port: '',
        pathname: '/favicon.ico',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/land",
        permanent: true,
      },
    ];
  },
};
