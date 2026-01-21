import SockJS from "sockjs-client";
import * as StompJs from "@stomp/stompjs";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(onConnected, onError) {
    const socket = new SockJS("http://localhost:8081/ws");
    this.stompClient = new StompJs.Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log("WebSocket connected");
        if (onConnected) onConnected();
      },
      onDisconnect: () => {
        this.isConnected = false;
        console.log("WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame);
        this.handleReconnect(onConnected, onError);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket connection error:", error);
        this.handleReconnect(onConnected, onError);
      },
    });

    this.stompClient.activate();
  }

  handleReconnect(onConnected, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => {
        this.connect(onConnected, onError);
      }, this.reconnectDelay);
    } else {
      console.error("Max reconnect attempts reached");
      if (onError) onError("Failed to connect to WebSocket");
    }
  }

  disconnect() {
    if (this.stompClient && this.isConnected) {
      this.unsubscribeAll();
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }

  subscribe(destination, callback, headers = {}) {
    if (!this.stompClient || !this.stompClient.active) {
      console.warn("WebSocket not ready, subscription delayed");
      setTimeout(() => this.subscribe(destination, callback, headers), 500);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error("Error parsing message:", error);
          callback(message.body);
        }
      }, headers);

      this.subscriptions.set(destination, subscription);
      console.log(`Subscribed to ${destination}`);
    } catch (error) {
      console.error("Subscription error:", error);
      setTimeout(() => this.subscribe(destination, callback, headers), 500);
    }
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from ${destination}`);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  send(destination, body, headers = {}) {
    if (!this.isConnected || !this.stompClient) {
      console.error("WebSocket not connected, cannot send message");
      return;
    }

    this.stompClient.publish({
      destination,
      body: JSON.stringify(body),
      headers,
    });
  }

  registerHandler(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
  }

  unregisterHandler(eventType, handler) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  triggerHandlers(eventType, data) {
    const handlers = this.messageHandlers.get(eventType) || [];
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in handler for ${eventType}:`, error);
      }
    });
  }

  isReady() {
    return this.isConnected && this.stompClient && this.stompClient.active;
  }
}

export default new WebSocketService();
