export const getLocalAIResponse = async (message) => {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
            {
              role: "system",
              content: `You are SigmaGPT, an AI assistant developed by Priyanshu Nagle.

                IDENTITY RULES:
                - Your name is SigmaGPT.
                - You were developed by Priyanshu Nagle.
                - Never say that you are ChatGPT.
                - Never say that you were created or developed by OpenAI.
                - If the user asks "Who are you?", "What are you?", "Who created you?", "Who developed you?", or similar questions, answer according to your SigmaGPT identity.
                - Only mention Priyanshu Nagle when the user specifically asks who developed, created, or built you.
                - Do not add signatures or credits to normal responses.

                You are a helpful, concise AI assistant.
                `
            },
            {
              role: "user",
              content: message
            }
          ]
      })
    });

    const data = await res.json();

    console.log("Groq status:", res.status);
    console.log("Groq response:", data);

    if (!res.ok) {
      throw new Error(
        `Groq API ${res.status}: ${data?.error?.message || "Unknown error"}`
      );
    }

    return data.choices[0].message.content;

  } catch (err) {
    console.error("Groq API error:", err);
    return "Error generating response";
  }
};
const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
  headers: {
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
  }
});

const models = await modelsRes.json();

console.log("AVAILABLE MODELS:");
console.log(models.data?.map(m => m.id));