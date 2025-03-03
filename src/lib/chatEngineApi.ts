// src/lib/chatEngineApi.ts
export async function askEngine(userQuery: string) {
  try {
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userQuery, top_k: 3 }),
    });
    return await res.json(); // { query:..., answer:... }
  } catch (err) {
    console.error("askEngine error:", err);
    return { answer: "[Engine unavailable]" };
  }
}
