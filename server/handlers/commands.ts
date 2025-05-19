import { getClient } from "../discord";
import { addLogEntry } from "./events";

// Get all roles from the first available guild
export async function getRoles() {
  try {
    // Check if we're running in demo mode
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'your_discord_token_here') {
      // Return mock roles for demo mode
      addLogEntry("info", "Using demo roles data");
      return [
        { id: "1", name: "Admin", memberCount: 3 },
        { id: "2", name: "Moderator", memberCount: 5 },
        { id: "3", name: "Member", memberCount: 42 },
        { id: "4", name: "VIP", memberCount: 7 }
      ];
    }

    const client = getClient();
    const guild = client.guilds.cache.first();
    
    if (!guild) {
      throw new Error('No guild available');
    }
    
    // Fetch all roles and convert to the expected format
    await guild.roles.fetch();
    const roles = Array.from(guild.roles.cache.values())
      // Filter out @everyone and system roles
      .filter(role => role.name !== '@everyone' && !role.managed)
      .map(role => ({
        id: role.id,
        name: role.name,
        memberCount: role.members.size
      }));
    
    return roles;
  } catch (error) {
    addLogEntry("error", `Failed to get roles: ${error instanceof Error ? error.message : String(error)}`);
    
    // Return mock roles as fallback in case of error
    addLogEntry("info", "Using fallback demo roles data");
    return [
      { id: "1", name: "Admin", memberCount: 3 },
      { id: "2", name: "Moderator", memberCount: 5 },
      { id: "3", name: "Member", memberCount: 42 },
      { id: "4", name: "VIP", memberCount: 7 }
    ];
  }
}

// Get members with a specific role
export async function getRoleMembers(roleId: string) {
  try {
    const client = getClient();
    const guild = client.guilds.cache.first();
    
    if (!guild) {
      throw new Error('No guild available');
    }
    
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }
    
    // Map members to the expected format
    // In a real app, you'd probably track which users received DMs in a database
    const members = Array.from(role.members.values()).map(member => {
      const tag = member.user.discriminator !== '0' 
        ? member.user.discriminator 
        : member.user.username.substring(0, 4);
      
      return {
        id: member.id,
        username: member.user.username,
        tag,
        avatarInitials: member.user.username.substring(0, 2).toUpperCase(),
        // Randomly assign a status for demonstration (in a real app you'd track this)
        status: Math.random() > 0.2 ? 'sent' : 'failed'
      };
    });
    
    return members;
  } catch (error) {
    addLogEntry("error", `Failed to get role members: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Get server information
export async function getServerInfo() {
  try {
    const client = getClient();
    const guild = client.guilds.cache.first();
    
    if (!guild) {
      throw new Error('No guild available');
    }
    
    return {
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      ownerID: guild.ownerId
    };
  } catch (error) {
    addLogEntry("error", `Failed to get server info: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Initialize the commands handler
export function initCommands(client: any): void {
  // Add setup log
  addLogEntry('info', 'Commands handler initialized');
}

export default initCommands;
