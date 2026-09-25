/** Curated ElevenLabs premade voice catalog for the admin "AI Agent" tab.
 *  IDs are ElevenLabs' stable premade voice identifiers — reselectable from
 *  the dropdown, or admin can paste any custom voice ID into the field. */

export type VoiceGender = "female" | "male" | "neutral";

export interface VoicePreset {
  id: string;
  name: string;
  gender: VoiceGender;
}

export const ELEVENLABS_VOICES: VoicePreset[] = [
  // Female
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "female" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", gender: "female" },
  { id: "AZnzlk1XvdvUeBnXmlkl", name: "Domi", gender: "female" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", gender: "female" },
  { id: "LcfcDiN3B44gKFXmWmGD", name: "Emily", gender: "female" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Alice", gender: "female" },
  // Male
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", gender: "male" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", gender: "male" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", gender: "male" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", gender: "male" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", gender: "male" },
  { id: "N2lXS1wIq5n1Lf9Ni52n", name: "Callum", gender: "male" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", gender: "male" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "male" },
];

export const VOICE_GENDER_LABELS: Record<VoiceGender, string> = {
  female: "Female",
  male: "Male",
  neutral: "Neutral",
};

export function voiceNameOf(id: string): string {
  const v = ELEVENLABS_VOICES.find((x) => x.id === id);
  return v ? `${v.name} (${VOICE_GENDER_LABELS[v.gender]})` : "Custom voice";
}

export const VOICE_PREVIEW_TEXT =
  "Hi, I'm the Climbix Assistant. I can help you with SEO, AI search optimization and lead generation. Would you like to book a free strategy call?";