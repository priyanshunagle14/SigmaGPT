export const getLocalAIResponse = async (message, history = [], model = "openai/gpt-oss-120b") => {
  try {
    const systemMessage = {
      role: "system",
      content: `You are SigmaGPT, a powerful, helpful, and concise AI assistant.

IDENTITY RULES:
- Your name is SigmaGPT.
- Never claim to be ChatGPT or created by OpenAI.
- If specifically asked who created or developed you, state you were developed by Priyanshu Nagle.
- Do not add unsolicited signatures, disclaimers, or credits to everyday responses.`
    };

    const formattedHistory = history
      .filter(m => m.role && m.content)
      .map(m => ({ role: m.role, content: m.content }));

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model || "openai/gpt-oss-120b",
        messages: [
          systemMessage,
          ...formattedHistory,
          { role: "user", content: message }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `Groq API ${res.status}: ${data?.error?.message || "Unknown error"}`
      );
    }

    return data.choices[0].message.content;

  } catch (err) {
    console.error("Groq API error:", err);
    return "Error generating response. Please check your network or try again.";
  }
};

// Streaming version - yields chunks of text
export const streamLocalAIResponse = async function* (message, history = [], model = "openai/gpt-oss-120b") {
  try {
    const systemMessage = {
      role: "system",
      content: `You are SigmaGPT, a powerful, helpful, and concise AI assistant.

IDENTITY RULES:
- Your name is SigmaGPT.
- Never claim to be ChatGPT or created by OpenAI.
- If specifically asked who created or developed you, state you were developed by Priyanshu Nagle.
- Do not add unsolicited signatures, disclaimers, or credits to everyday responses.`
    };

    const formattedHistory = history
      .filter(m => m.role && m.content)
      .map(m => ({ role: m.role, content: m.content }));

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model || "openai/gpt-oss-120b",
        messages: [
          systemMessage,
          ...formattedHistory,
          { role: "user", content: message }
        ],
        stream: true
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(
        `Groq API ${res.status}: ${data?.error?.message || "Unknown error"}`
      );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              yield content;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  } catch (err) {
    console.error("Groq streaming error:", err);
    yield "Error generating response. Please try again.";
  }
};