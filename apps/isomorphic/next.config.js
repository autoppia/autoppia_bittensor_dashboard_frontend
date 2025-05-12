/** @type {import('next').NextConfig} */
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
        source: '/',
        destination: '/leaderboard',
        permanent: true,
      },
      {
        source: '/metrics',
        destination: '/leaderboard',
        permanent: true,
      },
      {
        source: '/websites',
        destination: '/leaderboard',
        permanent: true,
      },
    ]
  },
};
