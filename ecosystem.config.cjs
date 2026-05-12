module.exports = {
  apps: [
    {
      name: 'memora',
      cwd: '/opt/memora-birthday-bot',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '300M',
      exp_backoff_restart_delay: 5000,
      autorestart: true,
      watch: false
    }
  ]
};
