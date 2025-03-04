import { Semaphore } from "async-mutex";
const BLUEHIVE_BEARER_TOKEN =
  process.env.NEXT_PUBLIC_BLUEHIVE_BEARER_TOKEN || "";

// Up to 5 concurrent calls
const BLUEHIVE_SEMAPHORE = new Semaphore(5);

/**
 * Calls BlueHive's API endpoint returning the assistant's text content.
 */
export async function bluehive_generate_text(
  prompt: string,
  systemMsg: string = ""
): Promise<string> {
  const url = "https://ai.bluehive.com/api/v1/completion";

  // request payload: { prompt, systemMessage }
  const payload = {
    prompt,
    systemMessage: systemMsg,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BLUEHIVE_BEARER_TOKEN}`,
  };

  try {
    // Acquire semaphore to limit concurrency
    const [, release] = await BLUEHIVE_SEMAPHORE.acquire();

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[bluehive_generate_text] HTTP Error:", res.status, text);
        return `[ERROR] BlueHive call failed with status ${res.status}`;
      }

      const data = await res.json();
      /**
       * Expected shape: data.choices[0].message.content
       *  "choices": [
       *    {
       *      "message": {
       *        "content": "..."
       *      }
       *    }
       *  ]
       */
      const choices = data.choices || [];
      if (!choices.length) {
        console.error("[bluehive_generate_text] Empty/Invalid text");
        return "[ERROR] Invalid text or server error.";
      }

      const content = choices[0]?.message?.content?.trim() || "";
      return content;
    } finally {
      // Call the releaser function to release the semaphore lock.
      release();
    }
  } catch (err: any) {
    console.error("[bluehive_generate_text] Unexpected error:", err);
    return '[ERROR]: An error occurred!';
  }
}
