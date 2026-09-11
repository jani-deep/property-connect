# Property Connect

I want to simplify and focus our demo preparation for the Florida legislator and Police Chief meeting.

 

We need to clearly demonstrate three connected pillars:

PropertyProof™ – Citizen Side

Law Enforcement Field Search

Florida Property Room Integration

 

This meeting is about showing how the ecosystem connects — from resident registration to statewide recovered property intelligence.

Here is exactly what we need to illustrate:

–––––––––––––––––––

PropertyProof™ – AI Inventory + DNA Placement (User Feature)
–––––––––––––––––––

Goal: Show how easy it is for a resident to build a verified inventory and connect it to forensic marking.

Demo Flow:

• User opens PropertyProof
• Takes photo of item
• System analyzes image and auto-detects:

Brand

Model

Category

Serial number (OCR if visible)

• System pre-fills item details
• User confirms/edit if needed

Then:

• User selects their DNA PIN
• Item image appears full screen
• User taps the exact area where they physically applied the DNA adhesive
• A subtle micro-indicator is placed at that location

Behavior:
• When tapped, the PIN enlarges and becomes readable
• When released, it shrinks back down to micro-size

This visually ties:
Physical adhesive → Digital record → Exact placement location

This is critical. It shows participation and forensic precision.

–––––––––––––––––––
2) Law Enforcement App – AI Image Search + Probability Results
–––––––––––––––––––

Goal: Show this is not just a database lookup — it is an intelligence engine.

Demo Flow:

• Officer opens LE app
• Takes photo of recovered item
• System analyzes image
• Searches user database

Results Screen:

Multiple matches returned with probability scores:

• 97% Match – John Smith – Brevard County
• 74% Possible Match – Similar Model – Orange County
• 18% Low Confidence – Model Only

Selecting a match shows:

• Registered owner info
• Status (reported stolen / not reported)
• Item image
• DNA adhesive placement markers

When officer taps the marked area:
• PIN enlarges
• Confirms where UV inspection should occur

This connects:
AI Recognition + Serial + DNA PIN + Placement Intelligence

That combination is powerful.

–––––––––––––––––––
3) Florida Property Room Integration
–––––––––––––––––––

This is where the legislative piece becomes important.

We need to demonstrate how this scales to:

• Agency property rooms
• Cross-agency matching
• Statewide integration

Demo Concepts:

A) Property Room Camera Matching

Property tech catalogs recovered item:
• Takes photo using system camera
• System auto-checks against user database
• Returns match probabilities

B) Bulk Serial / Image Matching

Property room uploads:
• Batch of serial numbers
OR
• Batch of images

System checks:
• Registered user database
• Other participating property rooms

Returns:
• Ownership matches
• Cross-agency matches
• Confidence scores

C) State-Level Dashboard (Mock is fine)

• Total registered assets
• Total agencies participating
• Cross-county recovery example
• Number of property room matches

This is where Florida legislation could support:

• Standardization
• Cross-agency participation
• Data-sharing framework
• Property room integration policy

We are not replacing existing systems.
We are adding a verified ownership layer.

–––––––––––––––––––
Demo Objective
–––––––––––––––––––

This demo must clearly show:

• Frictionless citizen inventory (PropertyProof)
• AI-powered law enforcement search with probability scoring
• Visual forensic validation (DNA placement markers)
• Property room workflow enhancement
• Statewide scalability

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ba7e5fda-8eef-49a8-adce-329826fd4d5b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
