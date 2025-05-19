# Discord Role DM Bot

A Discord bot that allows server administrators to send direct messages to all users with a specific role.

## Features

- Send direct messages to users with specific roles
- Automatically logs activity
- Simple Discord bot without web interface

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```
4. Start the bot for development:
   ```
   npm run dev
   ```

## Deployment on Render

1. Push this repository to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables:
   - DISCORD_TOKEN=your_discord_bot_token_here
6. Deploy!

## Troubleshooting

- If you see "Cannot find module '/opt/render/project/src/dist/index.js'", make sure:
  1. The build completed successfully (check build logs)
  2. The start command is correctly set to `npm start`
