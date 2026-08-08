// Claude-backed confirmation for fire/smoke candidates raised by a camera node.
//
// The node (a phone today, a GPU worker tomorrow) runs a cheap colour + flicker
// filter: high recall, poor precision. This is the judge that kills the false
// positives before they ever become an alert.
//
// The Anthropic key lives here and only here. It must never ship inside the
// mobile app — which is exactly why devices post frames to us rather than
// calling Claude themselves.

import Anthropic from "@anthropic-ai/sdk";

export type FireVerdict = {
  verdict: "fire" | "smoke" | "none";
  confidence: number;
  reasoning: string;
  falsePositiveCause: string;
};

const SYSTEM = `You are the confirmation stage of a fire-detection pipeline for small retail shops in Ghana.

A cheap on-device filter has flagged the attached frames as possibly showing fire or smoke. That filter has high recall and poor precision — it routinely trips on sunsets, heat lamps, incandescent bulbs, red or orange clothing, product packaging, TV and phone screens, and reflections off glass. Rejecting those is most of your job.

The frames are consecutive, captured about one second apart, from a camera that is not moving.

Call it fire only when you can see actual combustion: an irregular flame shape that changes between frames, a bright saturated core with a dimmer halo around it, and light being cast onto nearby surfaces.

Call it smoke only when you can see a diffuse grey or white mass that visibly drifts, billows, or grows across the frames and partially obscures whatever is behind it.

Otherwise return "none", and in falsePositiveCause name the thing that actually tripped the filter.

Two rules that outrank being helpful:
- A false alarm is expensive. A shop that stops trusting its alerts stops reading them, and then a real one gets ignored. When you are uncertain, return "none".
- A real fire is a life-safety event. If you can genuinely see combustion, say so plainly and do not hedge.

A static orange object is never fire, however bright it is. Fire shown on a screen — TV, monitor, phone — is not a fire in the room: return "none" and say it was a screen.`;

const SCHEMA = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["fire", "smoke", "none"],
      description: "What is actually happening in the frames.",
    },
    confidence: {
      type: "number",
      description: "0 to 1. How sure you are of the verdict.",
    },
    reasoning: {
      type: "string",
      description:
        "One or two sentences a shop owner would understand, describing what you saw. This is shown to them verbatim in the alert.",
    },
    falsePositiveCause: {
      type: "string",
      description:
        'When verdict is "none", the thing that tripped the filter (e.g. "sunset through the window"). Empty string otherwise.',
    },
  },
  required: ["verdict", "confidence", "reasoning", "falsePositiveCause"],
  additionalProperties: false,
} as const;

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  client = new Anthropic({ apiKey });
  return client;
}

/**
 * Ask Claude whether the frames really show fire or smoke.
 *
 * Thinking is left on at low effort: this is a judgement call where a wrong
 * answer costs either a false alarm or a missed fire, and a few seconds of
 * latency is irrelevant next to how fast a fire actually spreads.
 */
export async function confirmFireCandidate(args: {
  frames: string[]; // base64-encoded JPEG, no data: prefix
  candidate: "fire" | "smoke";
  localScore: number;
  cameraLabel: string;
}): Promise<FireVerdict> {
  const images = args.frames.map((data, i) => [
    {
      type: "text" as const,
      text: `Frame ${i + 1} of ${args.frames.length}:`,
    },
    {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/jpeg" as const,
        data,
      },
    },
  ]);

  // output_config carries both effort and the structured-output schema. Cast
  // through unknown so this compiles against SDK versions that predate the
  // field's typings; the wire shape is what matters.
  const params = {
    model: "claude-opus-5",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          ...images.flat(),
          {
            type: "text",
            text: `Camera: ${args.cameraLabel}. The on-device filter flagged this as "${args.candidate}" with a local score of ${args.localScore.toFixed(2)}. That score is only a colour and flicker heuristic — treat it as a hint, not evidence.`,
          },
        ],
      },
    ],
  } as unknown as Anthropic.MessageCreateParamsNonStreaming;

  const msg = await anthropic().messages.create(params);

  // Safety classifiers can decline; treat that as "no verdict" rather than fire.
  if (msg.stop_reason === "refusal") {
    return {
      verdict: "none",
      confidence: 0,
      reasoning: "Vision check could not complete.",
      falsePositiveCause: "refusal",
    };
  }

  const text = msg.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return unparsed();
  try {
    const parsed = JSON.parse(text.text) as FireVerdict;
    if (!["fire", "smoke", "none"].includes(parsed.verdict)) return unparsed();
    return parsed;
  } catch {
    return unparsed();
  }
}

// Fail closed: an unreadable verdict must never become a fire alert.
function unparsed(): FireVerdict {
  return {
    verdict: "none",
    confidence: 0,
    reasoning: "Vision check returned an unreadable verdict.",
    falsePositiveCause: "parse_error",
  };
}
