export async function fetchChats() {
  const res = await fetch("/api/chats", { method: "GET" });
  return res.json(); // { chats: [...] }
}

export async function createChat(title: string) {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function deleteChat(chatId: string) {
  const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
  return res.json();
}

export async function fetchChatMessages(chatId: string) {
  const res = await fetch(`/api/chats/${chatId}`);
  return res.json(); // { messages: [...] }
}

// Send user message => store user msg, calls the engine, store assistant msg
export async function sendUserMessage(chatId: string, content: string) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json(); // { userMsg, assistantMsg }
}
