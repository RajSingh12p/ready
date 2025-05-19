import { Client, GatewayIntentBits, Events, Role } from "discord.js";
import dotenv from "dotenv";
import chalk from "chalk";
import { addLogEntry } from "./handlers/events";

// Load environment variables
dotenv.config();

// Discord Client
let client: Client;

// Bot status tracking
let startTime: Date | null = null;
let currentStatus: 'online' | 'offline' = 'offline';
let currentServer: string = 'None';

// Styles for logging
const styles = {
  success: chalk.bold.green,
  error: chalk.bold.red,
  info: chalk.bold.blue
};

// Initialize Discord client
export function createClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
  });
}

// Start the Discord client
export async function startClient(): Promise<void> {
  try {
    // Check if Discord token is set
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'your_discord_token_here') {
      console.warn(styles.info('⚠️ Discord token not set or using default value. Running in demo mode.'));
      addLogEntry("info", "Discord token not set. Running in demo mode.");
      currentStatus = 'offline';
      startTime = new Date();
      return; // Exit early but don't throw error
    }
    
    // Create new client
    client = createClient();
    
    // Set up event handlers
    client.once(Events.ClientReady, () => {
      console.log(styles.success(`✅ Logged in as ${client.user?.tag}`));
      addLogEntry("success", `Logged in as ${client.user?.tag}`);
      startTime = new Date();
      currentStatus = 'online';
      
      // Set the bot's status and presence to Discord invite link
      try {
        client.user?.setActivity("https://discord.gg/97y4JVnhmh", {
          type: 0 // 0 is "PLAYING"
        });
        addLogEntry("info", "Bot status set to: https://discord.gg/97y4JVnhmh");
      } catch (error: any) {
        addLogEntry("error", `Failed to set status: ${error.message || 'Unknown error'}`);
      }
      
      // Set current server to the first guild if available
      if (client.guilds.cache.size > 0) {
        const firstGuild = client.guilds.cache.first();
        if (firstGuild) {
          currentServer = firstGuild.name;
        }
      }
    });
    
    // Handle DM command
    client.on(Events.MessageCreate, async (message) => {
      if (message.content.startsWith('!dmrole') && message.member?.permissions.has('Administrator')) {
        const args = message.content.split(' ');
        const roleName = args[1];
        
        if (!roleName) {
          message.reply('❌ Please specify a role name!');
          return;
        }
        
        const role = message.guild?.roles.cache.find(r => r.name === roleName);
        
        if (!role) {
          message.reply('❌ Role not found!');
          addLogEntry("error", `Role not found: ${roleName}`);
          return;
        }
        
        message.channel.send(`✅ Sending DMs to members with role: ${role.name}`);
        addLogEntry("info", `Sending DMs to members with role: ${role.name}`);
        
        let successCount = 0;
        let failedCount = 0;
        
        // Get the message content - everything after the roleName
        const dmContent = args.slice(2).join(' ') || 'Hello! This is a message from your server admin.';
        
        role.members.forEach(member => {
          member.send(dmContent)
            .then(() => {
              console.log(styles.success(`✅ DM sent to ${member.user.tag}`));
              addLogEntry("success", `DM sent to ${member.user.tag}`);
              successCount++;
            })
            .catch(err => {
              console.error(styles.error(`❌ Failed to DM ${member.user.tag}`));
              addLogEntry("error", `Failed to DM ${member.user.tag}`);
              failedCount++;
            });
        });
        
        // Log command processed
        addLogEntry("system", `Command processed: !dmrole ${roleName}`);
      }
    });
    
    // Error handling
    client.on('error', (err) => {
      console.error(styles.error('❌ Discord Client Error:', err));
      addLogEntry("error", `Discord Client Error: ${err.message}`);
      currentStatus = 'offline';
    });
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    
  } catch (error) {
    console.error(styles.error('❌ Failed to start Discord client:', error));
    addLogEntry("error", `Failed to start Discord client: ${error instanceof Error ? error.message : String(error)}`);
    currentStatus = 'offline';
    // Add some demo logs
    addLogEntry("info", "Application running in demo mode. Add a Discord token to connect to a real bot.");
  }
}

// Restart the Discord client
export async function restartClient(): Promise<void> {
  try {
    // Log restart attempt
    console.log(styles.info('🔄 Attempting to restart Discord client...'));
    addLogEntry("info", "Attempting to restart Discord client...");
    
    // Destroy existing client
    if (client) {
      await client.destroy();
    }
    
    // Start new client
    await startClient();
    
    console.log(styles.success('✅ Discord client restarted successfully'));
    addLogEntry("success", "Discord client restarted successfully");
  } catch (error) {
    console.error(styles.error('❌ Failed to restart Discord client:', error));
    addLogEntry("error", `Failed to restart Discord client: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Get client instance
export function getClient(): Client {
  if (!client) {
    // If we're in demo mode, create a mock client
    client = createClient();
  }
  return client;
}

// Get bot status
export async function getBotStatus() {
  const uptime = startTime ? getUptime(startTime) : 'N/A';
  
  return {
    status: currentStatus,
    uptime,
    server: currentServer,
    latency: client ? `${Math.round(client.ws.ping)}ms` : 'N/A'
  };
}

// Send DM to users with a specific role
export async function sendDMToRole(roleId: string, message: string) {
  try {
    if (!client) {
      throw new Error('Discord client has not been initialized');
    }
    
    // Get the role from the first guild (in a real app, you'd specify which guild)
    const guild = client.guilds.cache.first();
    if (!guild) {
      throw new Error('No guild available');
    }
    
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }
    
    addLogEntry("info", `Sending DMs to members with role: ${role.name}`);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Get members with the role
    const members = role.members;
    
    // Send DM to each member
    for (const [_, member] of members) {
      try {
        await member.send(message);
        addLogEntry("success", `DM sent to ${member.user.tag}`);
        successCount++;
      } catch (error) {
        addLogEntry("error", `Failed to DM ${member.user.tag}`);
        failedCount++;
      }
    }
    
    // Log command processed
    addLogEntry("system", `API call processed: DM to role ${role.name}`);
    
    return { successCount, failedCount };
  } catch (error) {
    addLogEntry("error", `Error sending DMs: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Helper function to calculate uptime
function getUptime(startTime: Date): string {
  const currentTime = new Date();
  const uptime = currentTime.getTime() - startTime.getTime();
  
  // Convert to days, hours, minutes
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} days, ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  } else {
    return `${minutes} minutes`;
  }
}
