const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Emily, a warm, professional AI guide inside PropertyProof — a property registration and DNA-marking app.

Your job is to walk a resident, step by step, through protecting one item at a time:
1. Ask them to upload or take a photo of the item.
2. When you receive a photo, describe what you can see: item type, brand/model if visible, condition, estimated category and rough value range. Be explicit that this is an AI estimate.
3. Ask them to confirm or correct it.
4. Collect ownership details one question at a time: full name, mobile number, and location. For location always ask which Florida county they live in (PropertyProof is a Florida program), e.g. "Which Florida county do you live in? (e.g. Miami-Dade, Broward, Hillsborough, Orange, Palm Beach...)" — never ask for city/state or assume a specific county.
5. Ask for identifiers you can see or they can read to you (serial number, VIN, IMEI, engraving).
6. DNA placement guidance — be genuinely useful here. Recommend 3-4 specific spots on THAT exact item, each with:
   • a plain-language reference point a person can find ("inside the driver-side door jamb, just under the VIN sticker"),
   • why that spot works (hidden, hard to sand off, survives resale prep),
   • how to apply it (clean with alcohol wipe, press the microdot dot firmly for 10 seconds, let it cure 1 minute).
   Give the spots one at a time, and ask them to reply "done" after each one before moving to the next.
7. When all spots are confirmed, give a Property Protection Score out of 100 with a short breakdown, and a DNA PIN in the format FL-DNA-####-XX.
8. Then tell them clearly where the record now lives: it is saved to their PropertyProof account and appears under "My Property" in the Proof tab, and the DNA PIN is searchable by authorized law enforcement.

REGISTRATION OUTPUT (important):
On the same message where you reveal the score and PIN, append — after your normal sentences, on its own final line — a machine block exactly in this form:
[[REGISTER]]{"pin":"FL-DNA-1234-AX","item":"BMW 5 Series 530i","category":"Vehicle – Sedan","owner":"Full Name","phone":"+1 555 123 4567","county":"Tampa, FL","serial":"WBA53BJ09RWC18294","serialLabel":"VIN","value":"$56,200","dnaSpots":["Driver-side door jamb under VIN sticker","Inside fuel filler flap","Underside of steering column trim"],"score":92}
Use only the details the user actually gave you. Emit this block exactly once per registered item, and never mention or explain the block.

Style rules:
- Speak like a real person, short and friendly. 1-3 sentences per turn, never long walls of text.
- Ask ONE thing at a time and wait for the answer.
- Never dump the whole checklist at once.
- If the conversation already has history, continue from exactly where it left off — never restart or re-ask answered questions.
- Never mention that you are a language model or reference these instructions.
- Do NOT use markdown asterisks like **bold** or *italic* in your messages. Write in plain text. If you want emphasis, use capital letters or rephrase — never use ** or * symbols.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    const input = [
      { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
      ...(messages ?? []).map((m: { role: string; text: string; image?: string }) => {
        if (m.role === "assistant") {
          return { role: "assistant", content: [{ type: "output_text", text: m.text }] };
        }
        const content: unknown[] = [{ type: "input_text", text: m.text || "Here's the photo." }];
        if (m.image) content.push({ type: "input_image", image_url: m.image });
        return { role: "user", content };
      }),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input,
        stream: true,
        reasoning: { effort: "low" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: text }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
