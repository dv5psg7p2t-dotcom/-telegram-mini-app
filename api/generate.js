export const config = {
  api: {
    bodyParser: { sizeLimit: "4mb" }
  }
};

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
    const { image, style } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(image);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const mime = match[1];
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const buffer = Buffer.from(match[2], "base64");

    const prompt = STYLES[style] || STYLES.enhance;

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("size", "1024x1024");
    form.append("image", new Blob([buffer], { type: mime }), `photo.${ext}`);

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API error"
      });
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(502).json({ error: "No image returned" });
    }

    return res.status(200).json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
