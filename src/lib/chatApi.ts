export async function createChat(title: string) {
  try {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Failed creating chat");
    }
    return await res.json(); // { id: string, title, ... }
  } catch (err) {
    console.error("createChat error:", err);
    throw err;
  }
}

export async function deleteChat(chatId: string) {
  try {
    const res = await fetch(`/api/chats/${chatId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Failed deleting chat");
    }
    return await res.json(); // { success: true }
  } catch (err) {
    console.error("deleteChat error:", err);
    throw err;
  }
}

/**
 * Send a new message to a chat. The server handles
 * storing & generating a response.
 */
export async function sendMessage(chatId: string, content: string) {
  try {
    const res = await fetch(`/api/chats/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Failed to send message");
    }
    return await res.json(); // { userMsg, assistantMsg }
  } catch (err) {
    console.error("sendMessage error:", err);
    throw err;
  }
}
