#!/bin/bash
# Start Knightbot-MD with PM2

# Install PM2 if not installed
npm install pm2 -g

# Start or restart the bot
pm2 start ecosystem.config.js --update-env

# Save the PM2 process list so it restarts after reboot
pm2 save

# Optional: show PM2 status
pm2 status
