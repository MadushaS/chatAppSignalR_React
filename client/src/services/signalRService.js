// src/services/signalRService.js
import * as signalR from "@microsoft/signalr";
import { authService } from "./authService";

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = {};
    this.connectionPromise = null;
    this.accessToken = null;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
    return () => {
      delete this.callbacks[event];
    };
  }

  off(event) {
    if (this.callbacks[event]) {
      delete this.callbacks[event];
      return true;
    }
    return false;
  }

  async startConnection(accessToken) {
    // Store token for reconnection
    this.accessToken = accessToken;


    // If connection already exists, return existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create a new connection promise
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl(`${import.meta.env.VITE_API_URL}/chathub`, {
            accessTokenFactory: async () => {
              const session = await authService.getCurrentSession();
              if (!session?.access_token) {
                throw new Error("No access token available");
              }
              return session.access_token;
            },
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
          .build();

        // Set up all event handlers
        this._setupEventHandlers();

        // Start the connection
        this.connection.start()
          .then(() => {
            console.log("SignalR Connected");
            resolve(true);
          })
          .catch(err => {
            console.error("SignalR Connection Error:", err);
            this.connectionPromise = null;
            reject(err);
          });
      } catch (err) {
        this.connectionPromise = null;
        reject(err);
      }
    });

    return this.connectionPromise;
  }


  _setupEventHandlers() {
    // Register all event handlers
    this.connection.on("ReceiveMessage", (user, message) => {
      this._invokeCallback("ReceiveMessage", user, message);
    });

    this.connection.on("ReceiveDirectMessage", (senderId, message) => {
      this._invokeCallback("ReceiveDirectMessage", senderId, message);
    });

    this.connection.on("UserJoined", (message) => {
      this._invokeCallback("UserJoined", message);
    });

    this.connection.on("ReceiveTypingIndicator", (senderId) => {
      this._invokeCallback("ReceiveTypingIndicator", senderId);
    });

    this.connection.on("UserStatusChanged", (userId, status) => {
      this._invokeCallback("UserStatusChanged", userId, status);
    });

    this.connection.on("MessagesMarkedAsRead", (readerId) => {
      this._invokeCallback("MessagesMarkedAsRead", readerId);
    });

    // Connection state events
    this.connection.onreconnecting((error) => {
      console.log("Attempting to reconnect:", error);
      this._invokeCallback("Reconnecting", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("Reconnected with ID:", connectionId);
      this._invokeCallback("Reconnected", connectionId);
    });

    this.connection.onclose((error) => {
      console.log("Connection closed:", error);
      this.connectionPromise = null;
      this._invokeCallback("Disconnected", error);
    });
  }

  _invokeCallback(event, ...args) {
    if (this.callbacks[event]) {
      this.callbacks[event](...args);
    }
  }

  // Helper method to ensure connection is active
  async _ensureConnection() {
    if (!this.isConnected()) {
      return this.startConnection(this.accessToken);
    }
    return Promise.resolve(true);
  }

  // Send direct message with retry logic
  async sendDirectMessage(recipientId, message) {
    try {
      await this._ensureConnection();
      await this.connection.invoke("SendDirectMessage", recipientId, message);
      return true;
    } catch (error) {
      console.error("Error sending direct message:", error);
      return false;
    }
  }

  // Send typing indicator with throttling built-in
  async sendTypingIndicator(recipientId) {
    try {
      await this._ensureConnection();
      await this.connection.invoke("SendTypingIndicator", recipientId);
      return true;
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      return false;
    }
  }

  // Update user status
  async updateUserStatus(status) {
    try {
      await this._ensureConnection();
      await this.connection.invoke("UpdateStatus", status);
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(senderId) {
    try {
      await this._ensureConnection();
      await this.connection.invoke("MarkMessagesAsRead", senderId);
      return true;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }
  }

  // Force reconnection
  async reconnect() {
    if (this.connection) {
      await this.stopConnection();
    }
    this.connectionPromise = null;
    return this.startConnection(this.accessToken);
  }

  // Stop connection
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR Disconnected.");
        this.connectionPromise = null;
        return true;
      } catch (err) {
        console.error("Error stopping connection:", err);
        return false;
      }
    }
    return false;
  }

  getConnectionState() {
    if (!this.connection) return "Disconnected";
    return this.connection.state;
  }

  isConnected() {
    return (this.getConnectionState() != "Disconnected");
  }
}
export const signalRService = new SignalRService();


