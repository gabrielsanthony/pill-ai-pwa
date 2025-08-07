// /api/generateQuestion.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Must be set in your Vercel project
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { medicine } = req.body;

  if (!medicine) {
    return res.status(400).json({ error: "Missing medicine name" });
  }

  try {
    const prompt = `
Generate ONE beginner-friendly multiple-choice question based on official NZ Consumer Medicine Information about the medicine "${medicine}". The question should teach the user something useful, such as:
- Why it's important
- When to take it
- How it works
- Side effects
- What to avoid

Respond ONLY with a JSON object using this exact format:
{
  "question": "string",
  "choices": ["A", "B", "C", "D"],
  "answer": "correct choice from above"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a friendly medical quiz generator using CMI data for New Zealand medications.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Try to extract and parse JSON from the result
    const text = response.choices[0]?.message?.content || "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    const rawJson = text.slice(jsonStart, jsonEnd);

    const quiz = JSON.parse(rawJson);

    if (!quiz.question || !quiz.choices || !quiz.answer) {
      return res.status(422).json({ error: "Invalid format from OpenAI" });
    }

    return res.status(200).json(quiz);
  } catch (error) {
    console.error("❌ Error generating quiz:", error);
    return res.status(500).json({ error: "Failed to generate quiz question" });
  }
}