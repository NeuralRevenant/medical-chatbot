"use client";

import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import ChatSidebar from "@/components/ChatSideBar";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useChats } from "@/lib/chatHooks";
import styles from "./home.module.scss";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>("");

  const { chats, isLoading } = useChats(); // SWR for chat list

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  function handleSelectChat(chatId: string) {
    setSelectedChatId(chatId);
    setSidebarOpen(false);
  }

  return (
    <div className={styles.homeContainer}>
      <ChatSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
      />

      <div className={styles.mainArea}>
        <TopBar toggleSidebar={toggleSidebar} />

        <div className={styles.chatContent}>
          {selectedChatId ? (
            <ChatMessages chatId={selectedChatId} />
          ) : (
            <div className={styles.welcomePane}>
              <h2>Welcome!</h2>
              <p>Select or create a chat, or type below to auto-create one.</p>
            </div>
          )}

          <ChatInput
            selectedChatId={selectedChatId}
            onChatCreated={(newChatId) => setSelectedChatId(newChatId)}
          />
        </div>
      </div>
    </div>
  );
}
