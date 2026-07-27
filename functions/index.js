/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { OpenAI } = require("openai");

admin.initializeApp();

// ✅ TU CLAVE CORRECTA (Ya configurada)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.analyzeEntry = onDocumentCreated("users/{userId}/entries/{entryId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const entry = snapshot.data();

  // Evitar bucles
  if (entry.ai_analysis) return;

  // Extraer datos
  const note = entry.note || "Sin nota";
  const mood = entry.mood || "Neutral";
  const energy = entry.energyLevel || 5;
  const sleep = entry.sleepHours || 0;
  const water = entry.waterLiters || 0;
  const exercise = entry.exerciseMinutes || 0;
  
  const habits = (entry.habits && entry.habits.length > 0) ? entry.habits.join(", ") : "Ninguno";
  const factors = (entry.factors && entry.factors.length > 0) ? entry.factors.join(", ") : "Ninguno";

  try {
    const prompt = `
      Actúa como un psicólogo experto y health coach.
      
      DATOS DEL USUARIO:
      - Emoción: ${mood}
      - Energía: ${energy}/10
      - Sueño: ${sleep}h
      - Agua: ${water}L
      - Ejercicio: ${exercise}min
      - Contexto: ${habits}, ${factors}
      - Nota: "${note}"

      INSTRUCCIONES:
      1. Relaciona los datos (ej: "Ansiedad por falta de sueño").
      2. Si hay riesgo grave, marca "risk_detected": true.
      3. Consejo breve (max 2 frases), cálido y en español.

      Responde SOLO en JSON:
      {
        "sentiment_score": (numero -1 a 1),
        "risk_detected": (boolean),
        "bot_suggestion": "Consejo..."
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Eres un asistente útil que responde en JSON." }, 
        { role: "user", content: prompt }
      ],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    return event.data.ref.update({
      ai_analysis: aiResponse,
      analyzed: true
    });

  } catch (error) {
    logger.error("Error OpenAI:", error);
    return null;
  }
});