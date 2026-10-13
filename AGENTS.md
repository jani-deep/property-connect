# Project architecture

- Keep David agency intake separate from recovered-item search chat so participant packages cannot trigger owner reveals or official case creation.
- The current intake experience is a browser-local demo with simulated delivery and verification; never describe its links, access controls or storage as production-secure.
- Use the intake session module as the single source for lifecycle, provenance, submission and agency-review/export gates; this keeps both consoles consistent.
- Preserve existing resident and LE authentication flows; publicly accessible intake URLs carry demo session context only.
- Preserve property registrations and original victim statements; theft incidents, structured versions and independent witness records are separate immutable-source layers.
- David intake conversations use AI SDK UIMessage streams and AI Elements; keep AI credentials and investigative prompts server-side.
- Guided participant chat maps explicit answers to intake fields through a pure transition module; AI suggestions never silently change attested facts.
- Guided intake voice uses the existing server-side David TTS persona and browser dictation; keep transcripts editable until explicitly submitted so voice cannot silently attest facts.