"use client";

import React, { useState } from "react";
import styles from "./chatSidebar.module.scss";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useChats } from "@/lib/chatHooks";
import { createChat, deleteChat } from "@/lib/chatApi";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}

export default function ChatSidebar({
  isOpen,
  toggleSidebar,
  selectedChatId,
  onSelectChat,
}: ChatSidebarProps) {
  const [error, setError] = useState("");
  const { chats, isLoading, mutate } = useChats();

  async function handleNewChat() {
    const title = prompt("Enter chat title:");
    if (!title) return;
    try {
      const newChat = await createChat(title);
      if (newChat?.id) {
        mutate();
        onSelectChat(newChat.id);
        toggleSidebar();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create chat");
    }
  }

  async function handleDeleteChat(chatId: string) {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      const res = await deleteChat(chatId);
      if (res?.success) {
        mutate();
        if (selectedChatId === chatId) {
          onSelectChat("");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete chat");
    }
  }

  function handleSelectChat(chatId: string) {
    onSelectChat(chatId);
    toggleSidebar();
  }

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <button onClick={toggleSidebar} className={styles.closeBtn}>
        &times;
      </button>

      <div className={styles.sidebarHeader}>
        <h2>My Chats</h2>
        <FaPen className={styles.penIcon} onClick={handleNewChat} />
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}
      {isLoading && <p className={styles.loadingMsg}>Loading chats...</p>}

      <div className={styles.chatList}>
        {chats?.map((chat) => (
          <div key={chat.id} className={styles.chatItem}>
            <span
              className={styles.chatTitle}
              onClick={() => handleSelectChat(chat.id)}
            >
              {chat.title}
            </span>
            <FaTrashAlt
              className={styles.deleteIcon}
              onClick={() => handleDeleteChat(chat.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
