export const getLocalAIResponse = async (message) => {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are SigmaGPT, a helpful and concise AI assistant developed by Priyanshu Nagle. Only mention Priyanshu Nagle if someone specifically asks who developed or created you. Never add signatures or credits at the end of responses." },
          { role: "user", content: message }
        ]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("Groq API error:", err);
    return "Error generating response";
  }
};