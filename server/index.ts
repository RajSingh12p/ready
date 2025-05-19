import { startClient, getClient } from "./discord";
import { initCommands } from "./handlers/commands";
import { initEvents, addLogEntry } from "./handlers/events";
import { connectToDatabase } from "./db";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Log startup
console.log("Starting Discord bot...");

// Connect to database
connectToDatabase().then(() => {
  console.log("Connected to database");
  
  // Start Discord client
  startClient()
    .then(() => {
      const client = getClient();
      
      // Initialize bot handlers
      initCommands(client);
      initEvents(client);
      
      addLogEntry('system', 'Bot started successfully');
      console.log("Bot is now online!");
    })
    .catch((error) => {
      console.error("Failed to start Discord client:", error);
      addLogEntry('error', `Failed to start: ${error.message}`);
    });
}).catch(err => {
  console.error("Failed to connect to database:", err);
});
