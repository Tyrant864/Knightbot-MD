module.exports = {
  apps: [
    {
      name: "Knightbot-MD",
      script: "index.js",      // Change this to your main bot file if different
      watch: false,            // Set true if you want PM2 to restart on code changes
      env: {
        NODE_ENV: "production"
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000      // 5 seconds delay between restarts
    }
  ]
};
