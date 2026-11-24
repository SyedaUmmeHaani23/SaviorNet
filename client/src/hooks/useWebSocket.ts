
import { useState, useEffect, useRef, useCallback } from "react";
import { WebSocketMessage } from "@shared/schema";

interface WebSocketOptions {
  onMessage?: (message: any) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  // Keep the latest message handler without restarting the socket.
  onMessageRef.current = onMessage;

  // Build WebSocket URL.
  const getWebSocketUrl = useCallback(() => {
    const protocol =
      window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${window.location.host}/ws`;
  }, []);

  // Establish WebSocket connection.
  const connect = useCallback(() => {
    if (!activeRef.current) return;

    // Prevent duplicate connections.
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (socketRef.current !== socket) return;

        console.log("WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      });

      socket.addEventListener("message", (event) => {
        if (socketRef.current !== socket) return;

        try {
          const message = JSON.parse(event.data);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
      });

      socket.addEventListener("close", () => {
        // Ignore events from an old or intentionally closed socket.
        if (socketRef.current !== socket) return;

        socketRef.current = null;
        setIsConnected(false);

        if (
          !activeRef.current ||
          reconnectAttemptsRef.current >= maxReconnectAttempts
        ) {
          console.log("WebSocket reconnect limit reached or connection stopped");
          return;
        }

        console.log("WebSocket disconnected. Reconnecting...");

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, reconnectInterval);
      });
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setIsConnected(false);
    }
  }, [
    getWebSocketUrl,
    reconnectInterval,
    maxReconnectAttempts,
  ]);

  // Send messages through the active connection.
  const sendMessage = useCallback((message: WebSocketMessage) => {
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("Cannot send message: WebSocket is not connected");
    }
  }, []);

  // Connect once when the hook mounts.
  useEffect(() => {
    activeRef.current = true;
    connect();

    return () => {
      activeRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const socket = socketRef.current;
      socketRef.current = null;

      if (socket) {
        socket.close();
      }

      setIsConnected(false);
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
  };
}
