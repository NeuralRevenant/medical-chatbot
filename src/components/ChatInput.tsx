"use client";

import React, { useState, ChangeEvent } from "react";
import { FaPlus } from "react-icons/fa";
import { useSession } from "next-auth/react";
import styles from "./chatInput.module.scss";

import { sendMessage, createChat } from "@/lib/chatApi";
import { fetchChatTitleFromLLM } from "@/lib/semanticEngine";
import { useChats, useChatMessages } from "@/lib/chatHooks";

interface Props {
  selectedChatId: string;
  onChatCreated: (chatId: string) => void;
}

export default function ChatInput({ selectedChatId, onChatCreated }: Props) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { mutate: mutateChats } = useChats();
  const { mutate: mutateMessages } = useChatMessages(selectedChatId);

  function setErrorMsg(err: string) {
    alert(`Error: ${err}`);
  }

  // handle file uploads (up to 10 .txt files & <= 20 MB total)
  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // limit max number of files
    if (files.length > 10) {
      setErrorMsg("You can upload up to 10 files at a time.");
      e.target.value = "";
      return;
    }

    // validate total size (<= 20MB) & .txt type
    let totalSize = 0;

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".txt")) {
        setErrorMsg(`File type not allowed: ${file.name}. Only .txt files are accepted.`);
        e.target.value = "";
        return;
      }
      totalSize += file.size;
    }

    if (totalSize > 20 * 1024 * 1024) {
      setErrorMsg("Total file size exceeds 20MB limit.");
      e.target.value = "";
      return;
    }

    if (!session?.user?.id) {
      setErrorMsg("User not found in session. Please log in.");
      e.target.value = "";
      return;
    }

    e.target.value = ""; // reset after successful selection

    // create FormData to send to local Next.js route:
    const formData = new FormData();
    formData.append("userId", session.user.id); // from next-auth session
    files.forEach((file) => formData.append("embeddingFiles", file));

    try {
      // POST to local route
      const res = await fetch("/api/file-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.error || "Failed to upload file/document");
      }

      alert("Successfully uploaded the documents!");
    } catch (err: any) {
      setErrorMsg(err.message || "Upload error occurred");
    } finally {
      e.target.value = ""; // reset input
    }
  }

  // handle text message submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = message.trim();
    if (!content) return;

    setIsSending(true);
    let chatId = selectedChatId;

    // If no chat is selected, auto-create one
    if (!chatId) {
      try {
        const derivedTitle = await fetchChatTitleFromLLM(content);
        const newChat = await createChat(derivedTitle);
        chatId = newChat.id;
        onChatCreated(chatId);
        await mutateChats();
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
      {/* '+' button */}
      <label htmlFor="fileUpload" className={styles.plusButton}>
        <FaPlus />
        <input
          id="fileUpload"
          type="file"
          style={{ display: "none" }}
          multiple
          accept=".txt"
          onChange={handleFileUpload}
        />
      </label>

      {/* input box */}
      <textarea
        rows={1}
        className={styles.inputBox}
        placeholder="Type your medical query..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending}
      />

      {/* send button */}
      <button
        type="submit"
        className={styles.sendButton}
        disabled={isSending}
      >
        {isSending ? <span className={styles.spinner}></span> : "Send"}
      </button>
    </form>
  );
}
