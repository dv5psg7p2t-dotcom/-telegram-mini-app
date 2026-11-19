export const config = {
  api: {
    bodyParser: { sizeLimit: "4mb" }
  }
};

// Модель можно поменять без правки кода: переменная GEMINI_MODEL в Vercel
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

const STYLES = {
  enhance:
    "Improve this photo: better lighting, color balance, sharpness and detail. Keep the same person, face, pose and composition. Do not change identity.",
  portrait:
    "Retouch this as a professional portrait: soft natural skin, balanced studio lighting, gentle background blur. Keep the same person and face exactly recognizable.",
  cinema:
    "Give this photo a cinematic look: teal and orange color grading, dramatic contrast, film grain. Keep the same person, face and composition.",
  natural:
    "Make this photo look natural and true to life: subtle correction of light and color only. Keep everything else unchanged."
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const { image, style } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(image);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const mimeType = match[1];
    const base64 = match[2];
    const prompt = STYLES[style] || STYLES.enhance;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API error"
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData || p.inline_data);

    if (!imagePart) {
      const text = parts.find((p) => p.text)?.text;
      const block = data?.promptFeedback?.blockReason;
      return res.status(502).json({
        error:
          text ||
          (block ? "Запрос заблокирован: " + block : "Модель не вернула изображение")
      });
    }

    const inline = imagePart.inlineData || imagePart.inline_data;
    const outMime = inline.mimeType || inline.mime_type || "image/png";

    return res.status(200).json({
      image: `data:${outMime};base64,${inline.data}`
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
