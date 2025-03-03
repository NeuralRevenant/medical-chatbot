"use client";

import React, { useEffect, useState } from "react";
import styles from "./chatSidebar.module.scss";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchChats, createChat, deleteChat } from "@/lib/chatApi";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function ChatSideBar({
  isOpen,
  toggleSidebar,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  // On initial mount, fetch all chats
  useEffect(() => {
    fetchChats()
      .then((res) => {
        if (res.chats) {
          setChats(res.chats);
        }
      })
      .catch((err) => console.error("Failed to fetch chats:", err));
  }, []);

  // Create new chat, then refresh & navigate to it
  async function handleNewChat() {
    const title = prompt("Enter chat title:");
    if (!title) return;
    const newChat = await createChat(title);
    if (newChat && typeof newChat.id === "string") {
      // Refresh chats
      const res = await fetchChats();
      if (res.chats) setChats(res.chats);

      // Navigate to newly created chat
      router.push(`/?chatId=${newChat.id}`);
      toggleSidebar();
    }
  }

  // Delete the specified chat by string ID
  async function handleDeleteChat(chatId: string) {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    const res = await deleteChat(chatId);
    if (res && res.success) {
      // Filter out deleted chat
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      router.push("/"); // go back to no chat selected
    } else {
      alert("Failed to delete chat.");
    }
  }

  // Select a chat by string ID
  function handleSelectChat(chatId: string) {
    router.push(`/?chatId=${chatId}`);
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

      <div className={styles.chatList}>
        {chats.map((chat) => (
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
