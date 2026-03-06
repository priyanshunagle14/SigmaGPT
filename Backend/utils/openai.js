import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getOpenAIAPIResponse = async (message) => {
  try {

    if (!message) {
      return "Message is empty";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    console.log("OpenAI Response:", completion);

    const reply =
      completion &&
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message &&
      completion.choices[0].message.content;

    return reply || "No response from AI";

  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return "Error generating response";
  }
};