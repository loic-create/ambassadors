// api/generate-post.js
// Vercel serverless function – no Express needed

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ⚠️ set this in Vercel, not in the code
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { context, tone } = req.body || {};

  if (!context || typeof context !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'context'" });
  }

  const finalTone =
    tone ||
    "Post LinkedIn clair, simple et inspirant, qui se termine par une invitation explicite à découvrir le site https://team-planet.com";

  const prompt =
    "Tu es copywriter Team for the Planet.\n" +
    "Écris un post LinkedIn engageant.\n\n" +
    `Contexte utilisateur : "${context}"\n` +
    `Ton souhaité : "${finalTone}"\n\n` +
    "Contraintes :\n" +
    "- Style simple et humain\n" +
    "- Phrases courtes\n" +
    "- CTA final pour rejoindre Team for the Planet\n";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const post =
      completion?.choices?.[0]?.message?.content || "Aucun texte généré.";

    return res.status(200).json({ post });
  } catch (err) {
    console.error("Erreur OpenAI:", err);
    return res.status(500).json({ error: "OpenAI request error" });
  }
}
