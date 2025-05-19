import chalk from "chalk";

// Define log entry type
export type LogType = 'success' | 'error' | 'info' | 'system' | 'all';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: string;
}

// Store logs in memory
const logs: LogEntry[] = [];
const MAX_LOGS = 1000; // Limit the number of logs to prevent memory issues

// Logging styles
const styles = {
  success: chalk.bold.green,
  error: chalk.bold.red,
  info: chalk.bold.blue,
  system: chalk.bold.white
};

// Add a log entry
export function addLogEntry(type: LogType, message: string): void {
  // Create timestamp
  const timestamp = new Date().toISOString();
  
  // Log to console with color
  const logStyle = styles[type] || styles.system;
  console.log(logStyle(`[${type.toUpperCase()}] ${message}`));
  
  // Add to logs array
  logs.unshift({
    type,
    message,
    timestamp
  });
  
  // Trim logs if they exceed maximum size
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
}

// Read logs with optional filtering
export function readLogs(filter?: LogType): LogEntry[] {
  if (!filter || filter === 'all') {
    return [...logs];
  }
  
  return logs.filter(log => log.type === filter);
}

// Clear logs
export function clearLogs(): void {
  logs.length = 0;
}

// Initialize the events handler
export function initEvents(client: any): void {
  // Add setup log
  addLogEntry('info', 'Events handler initialized');
}

export default initEvents;
