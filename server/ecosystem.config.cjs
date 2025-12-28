module.exports = {
  apps: [
    {
      name: 'insighthub-backend',
      script: './src/index.js',
      cwd: '/home/hesham/InsightHub/server',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=512',
      env_file: './.env',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        NODE_PATH: '/home/hesham/InsightHub/node_modules'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        NODE_PATH: '/home/hesham/InsightHub/node_modules'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
    },
  ],
};
