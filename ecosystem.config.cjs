module.exports = {
  apps: [
    {
      name: "codecollab-backend",
      cwd: "./backend",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/codecollab-error.log",
      out_file: "/var/log/pm2/codecollab-out.log",
      time: true,
    },
  ],
};
