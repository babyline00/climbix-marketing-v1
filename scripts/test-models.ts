import ZAI from "z-ai-web-dev-sdk";

const candidates = ["glm-4.6", "glm-4.5", "glm-4.5-air", "glm-4.5-flash", "glm-4-32b"];

const zai = await ZAI.create();
for (const model of candidates) {
  try {
    const r = await zai.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      thinking: { type: "disabled" },
      max_tokens: 512,
    } as never);
    const text = r?.choices?.[0]?.message?.content?.trim();
    console.log(`${model}: ${text ? "OK -> " + text.slice(0, 40) : "EMPTY"}`);
  } catch (e) {
    console.log(`${model}: FAIL -> ${(e as Error).message.slice(0, 120)}`);
  }
}
