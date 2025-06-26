import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatApp = () => {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe("/topic/messages", (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (client && input.trim() !== "") {
      client.publish({
        destination: "/app/chat",
        body: JSON.stringify({ sender: "User", content: input }),
      });
      setInput("");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.chatContainer}>
        <h2 style={styles.header}>💬 Live Chat App</h2>
        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: msg.sender === "User" ? "flex-end" : "flex-start",
                background: msg.sender === "User" ? "#7e57c2" : "#eeeeee",
                color: msg.sender === "User" ? "white" : "#333",
              }}
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <div style={styles.inputBox}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.sendButton}>➤</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  chatContainer: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "#ffffffcc",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#673ab7",
    color: "#fff",
    padding: "1rem",
    textAlign: "center",
    margin: 0,
    fontSize: "1.5rem",
  },
  chatBox: {
    height: "400px",
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    background: "#fafafa",
  },
  message: {
    maxWidth: "80%",
    padding: "0.6rem 1rem",
    borderRadius: "20px",
    fontSize: "0.95rem",
    lineHeight: "1.4",
    wordBreak: "break-word",
  },
  inputBox: {
    display: "flex",
    borderTop: "1px solid #ccc",
    background: "#fff",
    padding: "0.75rem",
  },
  input: {
    flex: 1,
    padding: "0.6rem 1rem",
    borderRadius: "20px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    outline: "none",
  },
  sendButton: {
    marginLeft: "0.5rem",
    backgroundColor: "#673ab7",
    color: "#fff",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "50%",
    fontSize: "1.2rem",
    cursor: "pointer",
    transition: "background 0.3s",
  }
};

export default ChatApp;
