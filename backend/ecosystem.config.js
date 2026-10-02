module.exports = {
  apps: [
    {
      name: 'video-platform-api',
      script: 'venv/bin/fastapi',
      args: 'run app/main.py --host 0.0.0.0 --port 8000',
      cwd: '/home/ubuntu/video-platform-aws/backend',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        PORT: 8000,
        HOST: '0.0.0.0'
      }
    }
  ]
};
