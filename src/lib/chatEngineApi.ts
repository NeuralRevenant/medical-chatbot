export async function askEngine(userQuery: string, top_k = 3) {
  try {
    console.log(`[Debug] query = ${userQuery}`);
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "query": userQuery }),
    });
    const data = await res.json(); // { query:..., answer:... }
    console.log(`[Debug] Response from the Semantic Query Engine: ${JSON.stringify(data)}`)
    return data;
  } catch (err) {
    console.error("askEngine error:", err);
    return { answer: "[Engine unavailable]" };
  }
}
