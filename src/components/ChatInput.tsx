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
  const [isSending, setIsSending] = useState(false);

  const { mutate: mutateChats } = useChats();
  const { mutate: mutateMessages } = useChatMessages(selectedChatId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = message.trim();
    if (!content) return;

    setIsSending(true);
    let chatId = selectedChatId;

    // If no chat selected => auto-create one with a derived title
    if (!chatId) {
      try {
        const derivedTitle = await fetchChatTitleFromLLM(content);
        const newChat = await createChat(derivedTitle);
        chatId = newChat.id;
        onChatCreated(chatId);
        await mutateChats(); // refresh chat list
      } catch (err: any) {
        console.error("Failed to auto-create chat:", err);
        setErrorMsg(err.message || "Failed to auto-create chat");
        setIsSending(false);
        return;
      }
    }

    // Send the message
    try {
      await sendMessage(chatId, content);
      await mutateMessages();
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setErrorMsg(err.message || "Failed to send message");
    }
    setIsSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.chatInputForm}>
      <textarea
        rows={1} // minimal row
        className={styles.inputBox}
        placeholder="Type your medical query..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={isSending}
      >
        {isSending ? <span className={styles.spinner}></span> : "Send"}
      </button>
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
    </form>
  );
}
