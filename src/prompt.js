const fs = require("fs");
const path = require("path");

function loadVisualLanguage() {
  const p = path.join(__dirname, "..", "references", "visual-language.md");
  return fs.readFileSync(p, "utf8");
}

const VISUAL_LANGUAGE = loadVisualLanguage();

const ANALYSIS_SYSTEM_PROMPT = `
You are the visual director of SIGNAL RIG, a contemporary digital-installation generator.
Your task is to look at the user's photos and short text, then convert them into ONE coherent installation concept.

${VISUAL_LANGUAGE}

Return ONLY valid JSON with exactly these fields:
{
  "title": "short installation title, max 7 words, preferably restrained English",
  "subtitle": "one short line, max 18 words",
  "mood": "3-6 concise mood / material keywords",
  "imagePrompt": "a detailed English image-generation prompt"
}

Rules for imagePrompt:
- Explicitly say that source photos should be preserved as recognizable photographic content displayed on the screens.
- Describe the physical installation, not an app UI.
- Prioritize asymmetry, thin structure, negative space, low-positioned screens, dark gallery environment and restrained green backing.
- Mention sparse editorial micro-typography only if useful.
- Do not add people unless people are already in source photos.
- Do not invent logos or readable brand marks.
- No cyberpunk, no neon spectacle, no scrapbook, no generic collage.
- The installation should feel buildable and photographed in a gallery.
`;

function buildUserContent(text, images) {
  const content = [
    {
      type: "text",
      text: [
        "User note:",
        text || "No note. Infer a restrained concept from the images.",
        "Create one authored installation concept, not multiple options."
      ].join("\n")
    }
  ];

  for (const url of images) {
    content.push({ type: "image_url", image_url: { url } });
  }
  return content;
}

const IMAGE_NEGATIVE_PROMPT = [
  "cyberpunk",
  "neon sci-fi",
  "hologram",
  "futuristic control room",
  "dashboard UI",
  "scrapbook",
  "torn paper collage",
  "stickers",
  "maximalism",
  "symmetrical photo grid",
  "thick frame",
  "oversized typography",
  "watermark",
  "logo",
  "low quality",
  "blurry",
  "deformed screens"
].join(", ");

module.exports = {
  ANALYSIS_SYSTEM_PROMPT,
  IMAGE_NEGATIVE_PROMPT,
  buildUserContent
};
