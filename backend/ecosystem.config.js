module.exports = {
  apps: [
    {
      name: 'video-platform-api',
      script: 'venv/bin/fastapi',
      args: 'run app/main.py --host 0.0.0.0 --port 8000',
      cwd: '/home/ubuntu/Desarrollo-y-despliegue-de-una-plataforma-de-videos-con-React-FastAPI-y-AWS/backend',
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
