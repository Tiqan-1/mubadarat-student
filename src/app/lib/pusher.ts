// src/lib/pusher.ts
import Pusher from 'pusher-js';

// Retrieve environment variables
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;

// A critical check to ensure the variables are defined
if (!pusherKey || !pusherCluster) {
  throw new Error("Missing Pusher environment variables. Check your .env.local file.");
}

// Enable pusher logging - useful for debugging, disable for production
// Pusher.logToConsole = true;

// Create and export the singleton instance of the Pusher client
export const pusherClient = new Pusher(pusherKey, {
  cluster: pusherCluster,
  forceTLS: true, // Enforces encrypted connection
});