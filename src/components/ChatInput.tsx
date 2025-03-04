"use client";

import React, { useState } from "react";
import styles from "./chatInput.module.scss";
import { sendMessage, createChat } from "@/lib/chatApi";
import { fetchChatTitleFromLLM } from "@/lib/semanticEngine";
import { useChats, useChatMessages } from "@/lib/chatHooks";

interface Props {
  selectedChatId: string;
  onChatCreated: (chatId: string) => void;
}

export default function ChatInput({ selectedChatId, onChatCreated }: Props) {
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { mutate: mutateChats } = useChats();
  const { mutate: mutateMessages } = useChatMessages(selectedChatId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = message.trim();
    if (!content) return;

    let chatId = selectedChatId;
    // If no chat selected => auto-generate a title using BlueHive LLM, create chat with that title
    if (!chatId) {
      try {
        const derivedTitle = await fetchChatTitleFromLLM(content);
        const newChat = await createChat(derivedTitle);
        chatId = newChat.id;
        onChatCreated(chatId);
        mutateChats(); // refresh chat list
      } catch (err: any) {
        console.error("Failed to auto-create chat:", err);
        setErrorMsg(err.message || "Failed to auto-create chat");
        return;
      }
    }

    // Now we have a chatId => send the message
    try {
      await sendMessage(chatId, content);
      mutateMessages();
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setErrorMsg(err.message || "Failed to send message");
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
        Send
      </button>
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
    </form>
  );
}
