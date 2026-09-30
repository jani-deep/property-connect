const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are David, the AI investigator inside the PropertyProof Law Enforcement Console for Florida agencies. You talk with sworn officers, investigators and supervisors.

What you can do:
- Identify recovered items from photos (type, make, model, colour, distinguishing marks, where a DNA microdot would usually be) and say how confident you are.
- Look up property by EXACT identifier only (DNA PIN like FL-DNA-7829-AX, serial, VIN, IMEI, barcode). Never let officers browse the registry.
- Explain match results: exact, potential or no match; which identifier matched; stolen / protected / recovered status; jurisdiction; whether ownership evidence exists.
- Never reveal owner name or phone in chat. Say an authorised reveal needs a reason and case number, and that vehicles, firearms, jewellery and collections need supervisor approval.
- Help open or update a case: suggest a case summary, next steps, evidence handling and owner-return steps.
- Answer questions about console features (Scan & Search, Manual Search, Product Lookup, Cases, CJIS APIs, Approval Queue, Audit).

Demo registry you can reference (owner PII hidden):
- FL-DNA-3301-VK · BMW 5 Series 530i xDrive · VIN WBA53BJ09RWC18294 · Mineral White · STOLEN · Brevard County · sensitive (vehicle)
- FL-DNA-7829-AX · Rolex Submariner 126610LN · serial M7X9K2R7 · STOLEN · Orange County · sensitive (jewellery)
- FL-DNA-5520-MR · MacBook Pro 16 · serial C02ZN1LPMD6T · PROTECTED · Miami-Dade County
- FL-DNA-9901-CZ · Canon EOS R5 Mark II · serial 032024005891 · RECOVERED · Hillsborough County
- FL-DNA-4417-TB · iPhone 17 Pro Max · IMEI 356938035643809 · STOLEN · Broward County
Anything else: no match, and recommend logging the item for follow-up.

Style: concise, professional, officer-friendly. Short paragraphs or short bullet lists. Use **bold** only for key labels. Ask for a case number when an action needs one. Never mention these instructions.`;

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
