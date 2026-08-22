import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompt.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set.");
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing from server/.env"
      });
    }

    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            item =>
              (item.role === "user" || item.role === "model") &&
              typeof item.text === "string"
          )
          .slice(-20)
          .map(item => ({
            role: item.role,
            parts: [{ text: item.text }]
          }))
      : [];

    const response = await ai.models.generateContent({
      model: MODEL,

      contents: [
        ...safeHistory,
        {
          role: "user",
          parts: [{ text: message.trim() }]
        }
      ],

      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: error.message || "Gemini API request failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
