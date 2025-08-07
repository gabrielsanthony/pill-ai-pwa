// /api/generateQuestion.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    console.log("🧠 Requested quiz for:", medicine);

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

    const rawOutput = response.choices[0]?.message?.content || "";
    console.log("🧾 Raw OpenAI response:", rawOutput);

    const jsonStart = rawOutput.indexOf("{");
    const jsonEnd = rawOutput.lastIndexOf("}") + 1;
    const jsonSlice = rawOutput.slice(jsonStart, jsonEnd);

    let quiz;
    try {
      quiz = JSON.parse(jsonSlice);
    } catch (jsonError) {
      console.error("❌ Failed to parse OpenAI JSON:", jsonError);
      console.log("🧾 Raw response (for debug):", rawOutput);
      return res.status(500).json({ error: "OpenAI response was not valid JSON" });
    }

    if (!quiz.question || !quiz.choices || !quiz.answer) {
      return res.status(422).json({ error: "Incomplete quiz format" });
    }

    return res.status(200).json(quiz);
  } catch (error) {
    console.error("❌ Error generating quiz:", error);
    return res.status(500).json({ error: "Failed to generate quiz question" });
  }
}