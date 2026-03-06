const path = require('path');

// Get the directory where this config file is located
const projectRoot = path.resolve(__dirname);
const userHome = require('os').homedir();

module.exports = {
  apps: [
    {
      name: "dev-infinitewebarena.autoppia.com",
      script: "pnpm",
      args: "start",
      cwd: projectRoot,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // Development environment
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        NEXT_PUBLIC_API_BASE_URL: "https://dev-api-leaderboard.autoppia.com",
        NEXT_PUBLIC_API_URL: "https://dev-api-leaderboard.autoppia.com",
      },

      error_file: path.join(userHome, ".pm2/logs/dev-infinitewebarena.autoppia.com-error.log"),
      out_file: path.join(userHome, ".pm2/logs/dev-infinitewebarena.autoppia.com-out.log"),
      log_file: path.join(userHome, ".pm2/logs/dev-infinitewebarena.autoppia.com-combined.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      time: true,
    },
    {
      name: "infinitewebarena.autoppia.com",
      script: "pnpm",
      args: "start",
      cwd: projectRoot,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // Production environment
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_BASE_URL: "https://api-leaderboard.autoppia.com",
        NEXT_PUBLIC_API_URL: "https://api-leaderboard.autoppia.com",
      },

      error_file: path.join(userHome, ".pm2/logs/infinitewebarena.autoppia.com-error.log"),
      out_file: path.join(userHome, ".pm2/logs/infinitewebarena.autoppia.com-out.log"),
      log_file: path.join(userHome, ".pm2/logs/infinitewebarena.autoppia.com-combined.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      time: true,
    },
  ],
};
