const { AgentRuntime, AgentDriver } = require("@vectorx/agent-runtime");
const {
  ANALYSIS_SYSTEM_PROMPT,
  IMAGE_NEGATIVE_PROMPT,
  buildUserContent
} = require("./prompt");

function parseInput(raw) {
  if (!raw) return { text: "", images: [], mode: "generate" };

  let payload = raw;
  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw);
    } catch (_) {
      return { text: raw, images: [], mode: "generate" };
    }
  }

  const images = Array.isArray(payload.images)
    ? payload.images.filter((x) => typeof x === "string" && x.trim())
    : payload.image
      ? [payload.image]
      : [];

  return {
    text: String(payload.text ?? payload.msg ?? "").trim(),
    images: images.slice(0, 8),
    mode: payload.mode === "concept" ? "concept" : "generate"
  };
}

function modelText(result) {
  if (typeof result === "string") return result;
  if (!result) return "";
  if (typeof result.text === "string") return result.text;
  if (typeof result.content === "string") return result.content;
  const c = result?.choices?.[0]?.message?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((x) => x?.text || x?.content || "").join("");
  return JSON.stringify(result);
}

function parseJsonLoose(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) {}
    }
  }

  return {
    title: "SIGNAL RIG",
    subtitle: "A small machine for holding recent signals.",
    mood: "quiet, physical, asymmetrical, archival",
    imagePrompt: cleaned
  };
}

function answerChunk(text) {
  return {
    choices: [
      {
        message: {
          role: "assistant",
          type: "answer",
          content: text
        }
      }
    ]
  };
}

class SignalRigAgent extends AgentRuntime {
  async sendMessage(input) {
    try {
      const { text, images, mode } = parseInput(input?.msg);

      if (!text && images.length === 0) {
        this.sseSender.send({
          data: answerChunk("请上传 1–8 张照片，或者写一句最近的心情。")
        });
        return;
      }

      const vision = this.createModel("qwen-vl-plus");
      const conceptRaw = await vision.generateText({
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: buildUserContent(text, images) }
        ],
        temperature: 0.55,
        max_tokens: 1400
      });

      const concept = parseJsonLoose(modelText(conceptRaw));
      const conceptText = [
        `《${concept.title || "SIGNAL RIG"}》`,
        concept.subtitle || "",
        concept.mood ? `\n${concept.mood}` : ""
      ].filter(Boolean).join("\n");

      this.sseSender.send({ data: answerChunk(conceptText) });

      if (mode === "concept") return;

      const imageModel = this.createModel("wan2.6-image");
      const sourceNote = images.length
        ? `Use the uploaded/source photographs as the visual content displayed on the installation's screens; keep their subjects recognizable. There are ${images.length} source images.`
        : "No source photographs were supplied; create screen content from the user's written note without adding unrelated people.";

      const finalPrompt = [
        concept.imagePrompt || "",
        sourceNote,
        "Photograph the complete installation as a real object in a gallery.",
        "Keep generous negative space around the object and make the structure legible.",
        "Composition should be suitable for a social-media artwork cover; keep the object centered enough to crop safely."
      ].join("\n");

      const stream = await imageModel.streamText({
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: finalPrompt }]
          }
        ],
        parameters: {
          size: process.env.IMAGE_SIZE || "1280*1280",
          n: 1,
          prompt_extend: true,
          watermark: false
        },
        negative_prompt: IMAGE_NEGATIVE_PROMPT
      });

      for await (const chunk of stream) {
        this.sseSender.send({ data: chunk });
      }
    } catch (error) {
      console.error("Signal Rig agent error", error);
      this.sseSender.send({
        data: answerChunk("生成失败了。可以换一组照片或把描述写得更具体一点再试。")
      });
    } finally {
      this.sseSender.end();
    }
  }
}

exports.main = function main(event, context) {
  return AgentDriver.run(event, context, new SignalRigAgent(context));
};
