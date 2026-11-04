import { mkdirSync, writeFileSync } from "node:fs";
import { narrationSegments } from "../remotion/pitch/data/narration";

// One-off script — run with: tsx --env-file=.env.local scripts/generate-voiceover.ts
// Regenerates the narration for the long-form "TRACIA-Pitch" composition.
// Re-run freely: ElevenLabs calls are idempotent per segment text, and this
// overwrites public/voiceover/tracia-pitch/*.mp3 in place.
// Segment text lives in remotion/pitch/data/narration.ts (shared with the
// composition) so the spoken words and the script here can't drift apart.

const VOICE_ID = "cjVigY5qzO86Huf0OWal"; // Eric — Smooth, Trustworthy
const MODEL_ID = "eleven_multilingual_v2";
const OUT_DIR = "public/voiceover/tracia-pitch";

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  // Optional: pass one or more segment ids to only regenerate those
  // (e.g. `tsx scripts/generate-voiceover.ts hook`) instead of burning
  // ElevenLabs quota re-generating all 14 after a single wording tweak.
  const onlyIds = process.argv.slice(2);
  const segments =
    onlyIds.length > 0
      ? narrationSegments.filter((s) => onlyIds.includes(s.id))
      : narrationSegments;
  if (onlyIds.length > 0 && segments.length !== onlyIds.length) {
    const found = new Set<string>(segments.map((s) => s.id));
    const missing = onlyIds.filter((id) => !found.has(id));
    throw new Error(`Unknown segment id(s): ${missing.join(", ")}`);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  for (const segment of segments) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: segment.text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `ElevenLabs error for "${segment.id}": ${res.status} ${body}`,
      );
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const outPath = `${OUT_DIR}/${segment.id}.mp3`;
    writeFileSync(outPath, buffer);
    console.log(`done: ${segment.id} (${buffer.length} bytes)`);
  }

  console.log("All segments generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
