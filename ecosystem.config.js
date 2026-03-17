module.exports = {
  apps: [
    {
      name: 'metaverse-http',
      cwd: './metaverse/apps/http',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 5432,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/http-error.log',
      out_file: './logs/http-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'metaverse-ws',
      cwd: './metaverse/apps/ws',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/ws-error.log',
      out_file: './logs/ws-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
