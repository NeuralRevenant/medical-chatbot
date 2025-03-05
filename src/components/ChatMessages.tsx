"use client";

import React from "react";
import { useChatMessages } from "@/lib/chatHooks";
import styles from "./chatMessages.module.scss";
import { FaSpinner } from "react-icons/fa";

interface Props {
  chatId: string;
}

export default function ChatMessages({ chatId }: Props) {
  const { messages, isLoading, isError } = useChatMessages(chatId);

  if (isLoading)
    return (
      <div className={styles.loading}>
        <FaSpinner className={styles.spinner} />
        Loading messages...
      </div>
    );
  if (isError)
    return <div className={styles.error}>Failed to load messages.</div>;
  if (!messages || messages.length === 0) {
    return <div className={styles.noMessages}>No messages yet for this chat.</div>;
  }

  return (
    <div className={styles.messagesContainer}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.messageBubble} ${msg.role === "assistant" ? styles.assistant : styles.user
            }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
