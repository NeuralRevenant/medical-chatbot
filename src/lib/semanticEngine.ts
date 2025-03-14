import { bluehive_generate_text } from "@/lib/bluehiveClient";

export async function fetchChatTitleFromLLM(
  userMessage: string
): Promise<string> {
  const systemMsg = `You are a helpful AI that must ONLY output a short descriptive chat title in 3 words or fewer. No extra text.`;

  // We ask BlueHive to generate only a short chat title
  const prompt =
    `User's first message:\n${userMessage}\n\n` +
    `Return a short descriptive chat title (3 words or fewer) summarizing the above user message. Do NOT add any additional text or disclaimers.`;

  try {
    // console.log("Prompt: " + prompt);
    // console.log("SystemMsg: " + systemMsg);
    const result = await bluehive_generate_text(prompt, systemMsg);
    if (!result) {
      return "Untitled Chat";
    }
    // Cleaning
    const title = result.trim().replace(/\r?\n|\r/g, "");
    // Safety checks
    if (!title || title.length > 80) {
      return "Untitled Chat";
    }
    return title;
  } catch (err) {
    console.error("Error generating chat title from BlueHive:", err);
    return "Untitled Chat";
  }
}
