# Drug Safety Explorer — spec.md

## Project Overview

Build a **Drug Safety Explorer** — a single-page web application that queries the OpenFDA API live to help users explore drug safety information. The tool investigates at least two drugs and surfaces meaningful safety information from OpenFDA endpoints. It must be deployed to GitHub Pages and is for **educational purposes only**.

---

## Theme & Visual Design

### Color Palette
- **Primary Blue**: `#1a3a6b` (deep navy)
- **Accent Red**: `#c0392b` (medical red)
- **Light Blue**: `#4a90d9`
- **Background**: `#0a1628` (near-black navy)
- **Surface**: `#112244`
- **Text Primary**: `#e8f0fe`
- **Text Secondary**: `#8aabdc`
- **Warning/Highlight**: `#e74c3c`
- **Success**: `#2ecc71`

### Aesthetic Direction: "Medical Lab Maximalism"
Dark navy background with vibrant red and blue accents. The UI should feel like a high-tech pharmaceutical research dashboard — serious, data-rich, but visually striking. Think CDC war room meets modern drug research interface.

### Required Decorative Elements

#### 🔴💊 Floating Pill Decorations (CSS Animated)
- Scatter **20–30 animated pill capsule shapes** across the background as CSS decorations
- Pills should be half red, half blue (the theme colors), rendered using CSS border-radius tricks
- Animate them floating upward slowly, rotating gently, at varying speeds and opacities (0.05–0.15 opacity so they don't distract)
- Different pill sizes (small, medium, large) randomly placed
- Use `@keyframes` for a continuous looping float animation

#### 🧬 Science & Medical Decorations
- **DNA double helix** SVG animation in the header background (subtle, low opacity)
- **Molecule node-and-bond** SVG decorations in corners or sidebar areas
- **Heartbeat/EKG line** SVG that animates across the header or footer
- **Microscope icon** or **flask icons** as section decorators
- **Cross/plus symbols** (medical cross ➕) as small decorative accents near headings
- **Hexagonal grid pattern** as a subtle background texture (low opacity)
- **Atom orbital rings** spinning slowly in the background or hero area

#### Typography
- Display font: `Bebas Neue` or `Oswald` (strong, clinical header feel)
- Body font: `IBM Plex Mono` or `Source Code Pro` (technical, data-oriented)
- Import from Google Fonts

---

## Required Disclaimer (must be displayed prominently)

```
⚠️ Educational Use Only — This tool is for learning purposes only. Always consult a healthcare professional for medical advice.
```

## Required OpenFDA Attribution (must appear in footer)

```
This product uses publicly available data from the U.S. Food and Drug Administration (FDA). FDA is not responsible for the product and does not endorse or recommend this or any other product.
```

---

## Technical Requirements

- **Single-page HTML/CSS/JS** (no frameworks required, but allowed)
- **No API key needed** — OpenFDA supports direct browser requests up to 240 requests/minute
- **Live API calls** — no hardcoded mock data
- Deployed to **GitHub Pages**
- Must work entirely client-side

---

## OpenFDA Endpoints to Use

Base URL: `https://api.fda.gov`

| Endpoint | Use |
|---|---|
| `/drug/label.json` | Drug interaction warnings, contraindications, adverse reactions, dosage |
| `/drug/event.json` | FAERS adverse event reports — real-world side effect submissions |
| `/drug/enforcement.json` | Drug recall history — classification, reason, dates |
| `/drug/ndc.json` | Drug identification and product info |

### Important Limitation to Communicate to Users
FAERS reports are **voluntarily submitted**. A report linking a drug to an adverse event does **not** prove causation. Report counts cannot estimate how common an event actually is. Your UI must communicate this clearly wherever adverse event data is shown.

---

## Core Features (Required)

### 1. Drug Search with Autocomplete
- Search input for **Drug A** and **Drug B**
- Autocomplete queries the `/drug/label.json` endpoint for drug name suggestions as the user types (debounced, ~300ms)
- Show both brand name and generic name
- Pre-populate on load with a known example: **Warfarin + Ibuprofen** (a well-known dangerous interaction pair)

### 2. Side-by-Side Drug Comparison View
- Display both drugs in a two-column layout
- Three tabs per comparison:
  - **Interaction Warnings** — from `/drug/label.json` → `drug_interactions` field
  - **Adverse Events** — from `/drug/event.json` — top reported reactions with counts
  - **Recall History** — from `/drug/enforcement.json` — timeline of recalls with severity classification

### 3. Adverse Events Visualization
- Bar chart or frequency chart showing the **top 10 most commonly reported adverse reactions** for each drug
- Use the `patient.reaction.reactionmeddrapt` field from `/drug/event.json`
- Color-code by severity where possible
- Include a visible disclaimer about voluntary reporting bias

### 4. Recall History Timeline
- Visual timeline of recalls for each drug
- Color-code by recall class:
  - **Class I** (red) — most serious, potential to cause serious health consequences
  - **Class II** (orange) — may cause temporary health consequences
  - **Class III** (yellow) — unlikely to cause health consequences
- Show recall reason and date

### 5. Co-Administration Analysis
- Query FAERS (`/drug/event.json`) to find reports where **both Drug A and Drug B appear together** in the same adverse event report
- Display count of co-administration reports
- List the most common reactions reported when both drugs are taken together

### 6. Graceful Error Handling
- If a drug has no adverse events: show a friendly message ("No adverse event reports found for this drug")
- If a drug is not found: "Drug not found — try a different name or spelling"
- If recalls return empty: "No recall history found"
- Loading states with animated spinner or skeleton UI

---

## Stretch Challenges (All Three Required)

### Stretch 1: Help Buttons & Educational Popups

Add small **ℹ️ info buttons** next to every key data section. When clicked, open a modal/popup with plain-language educational context.

**Required Help Popups:**

| Button Location | Popup Content |
|---|---|
| Next to "Adverse Events" heading | **How to Interpret Adverse Event Data** — FAERS reports are voluntary; correlation ≠ causation; popular drugs have more reports simply because more people take them |
| Next to "Recall History" heading | **Understanding Recall Classifications** — Class I (most serious, potential for serious health consequences), Class II (temporary health consequences), Class III (unlikely to cause health consequences), with real examples |
| Next to "Interaction Warnings" heading | **Drug Pairs with Known Dangerous Interactions** — highlight Warfarin + NSAIDs (bleeding risk), MAO inhibitors + serotonergic drugs (serotonin syndrome), Methotrexate + NSAIDs (methotrexate toxicity) |
| Next to "Drug Labels" section | **What Drug Labels Actually Tell You** — label data comes from FDA-approved prescribing information reviewed before drug approval; it's the most authoritative source |
| In the header/toolbar | **Why Some Drugs Have More Reports Than Others** — reporting bias explanation; commonly prescribed drugs have more reports regardless of their actual safety profile |
| In the footer or about section | **About This Tool** — general disclaimer, data sources, what this tool can and can't tell you, when to consult a healthcare professional |

**Modal Design Requirements:**
- Backdrop blur when modal is open
- Smooth fade-in animation
- Dismiss by clicking outside, pressing Escape, or clicking ✕ button
- Plain language — no medical jargon
- Blue/red themed modal styling consistent with overall design

### Stretch 2: Visual Storytelling

Build a **compelling data visualization** that tells a story beyond tables and lists.

**Requirements:**
- **Adverse Event Timeline**: Area or line chart showing *when* adverse events were reported over time (use `receivedate` field from FAERS) — show patterns, spikes, seasonal trends
- **Reaction Frequency Wheel or Treemap**: Visual breakdown of reaction types by category (cardiac, neurological, gastrointestinal, etc.)
- **Severity Breakdown Chart**: Distinguish serious outcomes (hospitalization, death, life-threatening) from non-serious ones using the `serious` and `seriousnessXxx` fields in FAERS
- Charts should animate on load (CSS or JS animation)
- Include a brief narrative summary above each chart: "Drug X had a spike in reports in [year] — this may correspond to [context]"

### Stretch 3: Drug Class Exploration

Instead of only individual drug comparison, let users explore **entire drug classes**.

**Requirements:**
- Add a **"Explore a Drug Class"** mode toggle
- Dropdown to select a drug class:
  - SSRIs (antidepressants): fluoxetine, sertraline, paroxetine, escitalopram
  - Statins (cholesterol): atorvastatin, simvastatin, rosuvastatin, pravastatin
  - ACE Inhibitors (blood pressure): lisinopril, enalapril, ramipril, captopril
  - NSAIDs (pain/inflammation): ibuprofen, naproxen, celecoxib, diclofenac
- Query FAERS and label data for all drugs in the class
- Display:
  - Comparative adverse event rates across the class
  - Which drugs in the class have the most recall history
  - Side-by-side safety profile comparison within the class
- Map individual drugs to their classes using OpenFDA's label data (`pharm_class_epc` field)

---

## UI Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [💊 FLOATING PILLS BACKGROUND ANIMATION]                   │
│  [DNA HELIX + MOLECULE DECORATIONS]                         │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║  ⚕️  DRUG SAFETY EXPLORER        [ℹ️ About This Tool] ║  │
│  ║  [EKG HEARTBEAT LINE ANIMATION]                       ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                             │
│  ⚠️ Educational Use Only Banner                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MODE: [Drug Comparison] [Drug Class Explorer]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  VS  ┌──────────────┐  [COMPARE]        │
│  │  DRUG A 🔍   │      │  DRUG B 🔍   │                   │
│  │  [autocomplete]     │  [autocomplete]                   │
│  └──────────────┘      └──────────────┘                   │
│                                                             │
│  ┌─[Interaction Warnings ℹ️]─[Adverse Events ℹ️]─[Recalls ℹ️]─┐ │
│  │                                                         │ │
│  │  DRUG A                    │  DRUG B                   │ │
│  │  [data panel]              │  [data panel]             │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [VISUAL STORYTELLING CHARTS — Stretch 2]                   │
│  [DRUG CLASS EXPLORER — Stretch 3]                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  FDA Attribution · Educational Use Only                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Animations & Interactions

- **Pill float animation**: continuous CSS `@keyframes` float — pills drift upward, rotate, fade in/out
- **EKG line**: SVG stroke-dashoffset animation running across header
- **Atom orbitals**: CSS rotation animation on decorative atom SVGs
- **Card hover**: subtle lift + blue glow effect on data cards
- **Tab switch**: smooth slide/fade transition between tabs
- **Data load**: skeleton shimmer animation while API calls are in-flight
- **Modal open/close**: backdrop blur fade + modal scale-in animation
- **Chart bars**: animate in from zero on first render
- **Autocomplete dropdown**: slide-down with opacity fade

---

## File Structure (for GitHub Pages)

```
/
├── index.html          ← entire app (HTML + embedded CSS + JS)
├── README.md
```

Keep everything in a single `index.html` for simplicity and GitHub Pages compatibility.

---

## Data Handling Notes

- **Debounce** autocomplete requests (300ms) to avoid rate limiting
- Always show a **"Data last updated"** note (OpenFDA updates quarterly)
- Handle `null` / missing fields gracefully — many drugs will have incomplete data
- The `drug/event.json` endpoint needs a search query like: `search=patient.drug.medicinalproduct:"WARFARIN"&count=patient.reaction.reactionmeddrapt.exact&limit=10`
- For label data: `search=openfda.brand_name:"WARFARIN"&limit=1`
- For enforcement: `search=openfda.brand_name:"WARFARIN"&limit=10`

---

## Required Content: Limitations to Communicate

The UI must make these limitations visible (not buried):

1. FAERS data is self-reported — not verified causal links
2. More reports ≠ more dangerous (popular drugs get more reports)
3. This tool is NOT a substitute for professional medical advice
4. Data may be incomplete or outdated
5. Drug name matching is imperfect — brand vs. generic names may give different results

---

*Built for: Vibe Coding · Code Quest · frontiersof.tech · University of Nebraska at Omaha*
