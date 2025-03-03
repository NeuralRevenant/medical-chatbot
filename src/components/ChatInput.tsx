"use client";

import React, { useState } from "react";
import styles from "./chatInput.module.scss";
import { FaPaperPlane } from "react-icons/fa";
import { sendUserMessage } from "@/lib/chatApi";

interface Props {
  chatId: string | null;
  onNewMessages: (msgs: any[]) => void;
}

export default function ChatInput({ chatId, onNewMessages }: Props) {
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    if (!chatId) {
      alert("No chat selected. Please create or select a chat first.");
      return;
    }

    try {
      // This calls the "POST /api/chats/[chatId]" route to store user + get assistant
      const res = await sendUserMessage(chatId, message);
      // res => { userMsg, assistantMsg }
      if (res.userMsg && res.assistantMsg) {
        // pass them up to refresh the chat
        onNewMessages([res.userMsg, res.assistantMsg]);
      }
      setMessage("");
    } catch (err) {
      console.error("Failed sending user message:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.chatInputForm}>
      <input
        type="text"
        className={styles.inputBox}
        placeholder="Type your medical query..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className={styles.sendButton}>
        <FaPaperPlane />
      </button>
    </form>
  );
}
