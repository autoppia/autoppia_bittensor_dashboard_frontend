module.exports = {
  apps: [
    {
      name: 'autoppia-dashboard',
      script: 'pnpm',
      args: 'run dev',
      cwd: '/home/usuario1/autoppia/autoppia_bittensor_dashboard_frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
