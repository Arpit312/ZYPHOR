/**
 * Calls the Google Gemini REST API.
 * Requires GEMINI_API_KEY to be set in the environment.
 */
export async function callGemini({ system, content }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "GEMINI_API_KEY is not set. Add it to .env.local to enable the AI agents."
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Combine system instruction into the main prompt for simple content generation
  // Or use systemInstruction feature of Gemini API if needed.
  // We'll format the payload properly.
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: content }]
      }
    ],
    systemInstruction: system ? {
      parts: [{ text: system }]
    } : undefined,
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Gemini API error (${res.status}): ${text}` };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return { ok: true, text, raw: data };
  } catch (err) {
    return { ok: false, error: err.message || "Failed to call Gemini API" };
  }
}

/** Strips ```json fences etc. and parses model JSON output safely. */
export function parseModelJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
