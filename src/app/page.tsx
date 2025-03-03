"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./home.module.scss";
import ChatSideBar from "@/components/ChatSideBar";
import TopBar from "@/components/TopBar";
import ChatInput from "@/components/ChatInput";
import { fetchChatMessages } from "@/lib/chatApi";

interface Message {
  id: string;
  role: string;
  content: string;
}

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const searchParams = useSearchParams();

  const chatId = searchParams.get("chatId");

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  // Load messages whenever chatId changes
  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId)
        .then((res) => {
          if (res.messages) setMessages(res.messages);
        })
        .catch((err) => console.error("Failed fetching messages:", err));
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Append newly created user & assistant messages
  function handleNewMessages(newMsgs: Message[]) {
    setMessages((prev) => [...prev, ...newMsgs]);
  }

  return (
    <div className={styles.homeContainer}>
      <ChatSideBar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={styles.separator}></div>

      <div className={styles.mainArea}>
        <TopBar toggleSidebar={toggleSidebar} />

        <div className={styles.chatContent}>
          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.assistantBubble}>
                <p>
                  Welcome! Select or create a chat, then ask your medical query.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.role === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble
                  }
                >
                  <p>{msg.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat input */}
          <ChatInput chatId={chatId} onNewMessages={handleNewMessages} />
        </div>
      </div>
    </div>
  );
}
