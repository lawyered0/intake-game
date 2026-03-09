# Closing Table — The Deal Negotiation Game

## Product & Engineering Spec for Coding Agent

**Author:** Jonathan Kleiman / Lawyered  
**Date:** March 2026  
**Repo:** `lawyered0/closing-table` (new repo)  
**Deploy:** Vercel (same pattern as `lawyereds-lsat-game.vercel.app`)

---

## 1. What This Is

A free, browser-based, single-player deal negotiation game. The player takes a role in a commercial negotiation scenario, makes choices each round, and gets scored at the end. No login, no backend, no API keys. Pure static site.

**Comparable to:** Hostage Negotiator (CrazyGames) meets Harvard PON role-plays, but as a free browser game aimed at law students, business students, and professionals.

**Brand:** "Closing Table" by Lawyered (or just "Lawyered's Negotiation Game" — decide later).

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js (App Router) | Same as LSAT game |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Dark theme, legal/professional aesthetic |
| State | React state (useState/useReducer) | No external state library needed |
| Data | Static JSON files in `/data/scenarios/` | No database, no API |
| Deploy | Vercel | Auto-deploy from `main` branch |
| Analytics | Vercel Analytics (optional) | Free tier |

**No backend. No auth. No database. Everything runs client-side.**

---

## 3. Game Architecture

### 3.1 Core Game Loop

```
[Scenario Select] → [Briefing] → [Round 1] → [Round 2] → ... → [Round N] → [Scorecard] → [Share/Replay]
```

### 3.2 Screens

1. **Home / Scenario Select** — Grid of scenario cards. Each shows title, difficulty, deal type, estimated time (3-5 min).
2. **Briefing Screen** — Your role, your client's goals, your BATNA, key constraints, what you know about the other side. "Start Negotiation" button.
3. **Negotiation Round** (repeated 5-8 times per scenario) — The other side says/does something. You pick from 3-4 response options. Live meters update after each choice.
4. **Scorecard** — Final results: deal value achieved, risk exposure, relationship score, client satisfaction. Letter grade (A+ through F). Breakdown of key moments ("You left $200K on the table by conceding on indemnity before trading for escrow release"). Share button.
5. **Share/Replay** — "Play Again" (same scenario, try different strategy), "Try Another Scenario", share to Twitter/LinkedIn with score.

### 3.3 State Machine

Each scenario is a finite state machine. No AI, no randomness (v1).

```
type GameState = {
  scenarioId: string;
  currentRoundIndex: number;
  meters: {
    dealValue: number;        // 0-100 (normalized)
    riskExposure: number;     // 0-100 (lower is better)
    relationship: number;     // 0-100
    clientSatisfaction: number; // 0-100
  };
  choiceHistory: string[];    // array of chosen option IDs
  currentNodeId: string;      // current node in scenario graph
};
```

---

## 4. Scenario Data Schema

Each scenario is a single JSON file in `/data/scenarios/`.

```typescript
// /types/scenario.ts

interface Scenario {
  id: string;
  title: string;                    // "The Startup Acquisition"
  subtitle: string;                 // "Acqui-hire gone sideways"
  dealType: DealType;               // "M&A" | "Lease" | "Settlement" | "TermSheet" | "Employment" | "IP License"
  difficulty: 1 | 2 | 3;           // 1=beginner, 2=intermediate, 3=advanced
  estimatedMinutes: number;         // 3-5 typical
  playerRole: string;               // "Outside counsel for BuyerCo"
  counterpartyRole: string;         // "Founder/CEO of TargetCo"
  
  briefing: {
    situation: string;              // 2-3 paragraphs of context
    clientGoals: string[];          // ["Acquire the team for <$5M", "Retain all 3 key engineers for 2+ years"]
    batna: string;                  // "Walk away and hire individually — costs ~$3M but takes 6 months"
    constraints: string[];          // ["Board has approved up to $6M", "Must close within 30 days"]
    intelOnOtherSide: string[];     // ["Founder has another offer from BigCorp", "Two engineers have competing offers"]
  };

  initialMeters: {
    dealValue: number;
    riskExposure: number;
    relationship: number;
    clientSatisfaction: number;
  };

  nodes: Record<string, ScenarioNode>;
  startNodeId: string;
}

interface ScenarioNode {
  id: string;
  round: number;                    // which round this belongs to (for progress bar)
  narration: string;                // what the other side says/does (shown as dialogue or description)
  speakerName?: string;             // "Alex Chen, CEO" (shown in dialogue bubble)
  options: NodeOption[];
  isTerminal?: boolean;             // if true, this node ends the game
}

interface NodeOption {
  id: string;
  label: string;                    // short label shown on button: "Push for lower price"
  description: string;              // 1-2 sentences shown on hover/expand: "Counter at $3.5M, citing comparable acquisitions"
  meterEffects: {
    dealValue: number;              // delta, e.g. +10 or -5
    riskExposure: number;
    relationship: number;
    clientSatisfaction: number;
  };
  nextNodeId: string;               // which node to go to next
  feedback?: string;                // shown briefly after selection: "Strong move — anchoring low gives you room to concede."
  tags?: string[];                  // ["anchoring", "aggressive", "collaborative"] — used in scorecard analysis
}

type DealType = "M&A" | "Lease" | "Settlement" | "TermSheet" | "Employment" | "IPLicense";
```

### 4.1 Branching Model

The scenario graph is a **directed acyclic graph (DAG)**, not a pure tree. Multiple options can converge to the same node (to keep scenario files manageable). Typical structure:

```
         Round 1
        /   |   \
       A    B    C
      / \   |   / \
     D   E  F  G   H     ← some of these can be the same node
      \  |  | /   /
       Round 3 nodes...
         ...
       Terminal nodes (2-4 different endings)
```

**Target: 5-8 rounds per scenario, 3-4 options per round, 2-4 distinct endings.**

Each scenario JSON file should be 200-400 lines. Keep them hand-authored for quality.

---

## 5. UI/UX Specification

### 5.1 Visual Design

- **Theme:** Dark background (#0a0a0a or similar), with accent colors per deal type
- **Typography:** Inter or system font stack. Large readable text.
- **Aesthetic:** Clean, slightly dramatic. Think "dark mode Bloomberg terminal meets Suits."
- **No illustrations needed for v1.** Typography and layout carry the design.

### 5.2 Meter Display

Four horizontal bar meters, always visible during negotiation rounds. Positioned at the top or in a sidebar.

```
Deal Value        ████████░░░░░░░░░  52%
Risk Exposure     ███░░░░░░░░░░░░░░  18%  (green = low = good)
Relationship      ██████████░░░░░░░  65%
Client Satisfaction ███████░░░░░░░░░  45%
```

- Meters animate on change (smooth transition, ~300ms)
- Color coding: green (good), yellow (caution), red (danger)
- Risk Exposure is inverted: low = green, high = red
- Brief pulse/glow effect when a meter changes significantly (±15 or more)

### 5.3 Negotiation Round Screen Layout

```
┌─────────────────────────────────────────────┐
│  [Meters]                    Round 3 of 7   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 💬 Alex Chen, CEO                  │    │
│  │                                     │    │
│  │ "We've had interest from BigCorp,   │    │
│  │  so $5M is really our floor. But    │    │
│  │  we value working with your team."  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  YOUR MOVE:                                 │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ▶ Hold firm at $3.5M               │    │
│  │   "Comparable deals in this space   │    │
│  │    closed at $3-4M..."             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ▶ Split the difference at $4.25M   │    │
│  │   "Let's find middle ground and     │    │
│  │    focus on the retention terms..." │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ▶ Shift to non-price terms         │    │
│  │   "Before we finalize price, let's  │    │
│  │    discuss the earn-out structure." │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.4 Scorecard Screen

After the final round, show:

1. **Final meter values** with letter grade (calculated from weighted average)
2. **Outcome narrative** — 2-3 sentences describing what happened ("You closed the deal at $4.25M with a two-year retention package. The founder is satisfied but your client's board is questioning the premium over BATNA.")
3. **Key Moments** — 2-3 bullet points calling out pivotal choices and what they cost/gained. Pull from the `feedback` and `tags` fields.
4. **Negotiation Style** — Based on tags of chosen options, label the player's dominant style: "Competitive", "Collaborative", "Compromising", "Analytical", "Avoidant"
5. **Share button** — Generates a text block for Twitter/LinkedIn: "I scored B+ on 'The Startup Acquisition' at Closing Table by @lawyered0. Can you do better? [link]"
6. **Play Again / Try Another** buttons

### 5.5 Grading

```typescript
function calculateGrade(meters: Meters): string {
  const weighted = (
    meters.dealValue * 0.35 +
    (100 - meters.riskExposure) * 0.25 +
    meters.relationship * 0.15 +
    meters.clientSatisfaction * 0.25
  );
  if (weighted >= 90) return "A+";
  if (weighted >= 85) return "A";
  if (weighted >= 80) return "A-";
  if (weighted >= 75) return "B+";
  if (weighted >= 70) return "B";
  if (weighted >= 65) return "B-";
  if (weighted >= 60) return "C+";
  if (weighted >= 55) return "C";
  if (weighted >= 50) return "C-";
  if (weighted >= 40) return "D";
  return "F";
}
```

---

## 6. Scenarios to Build (v1 — ship with 3)

### Scenario 1: "The Startup Acquisition" (Beginner)
- **Deal type:** M&A (acqui-hire)
- **You are:** Outside counsel for BuyerCo
- **They are:** Founder/CEO of a 10-person AI startup
- **Core tension:** Price ($3M-$6M range), key employee retention, IP assignment, earn-out vs. upfront
- **Concepts taught:** Anchoring, BATNA awareness, trading across issues (logrolling), relationship preservation
- **Rounds:** 6

### Scenario 2: "The Commercial Lease" (Intermediate)
- **Deal type:** Lease negotiation
- **You are:** Counsel for a growing SaaS company (tenant)
- **They are:** Landlord's broker for a Class A office building
- **Core tension:** Base rent vs. TI allowance vs. term length, personal guarantee, exclusivity clause, early termination
- **Concepts taught:** Package deals, concession strategy, non-monetary value creation, deadline pressure
- **Rounds:** 7

### Scenario 3: "The Settlement Conference" (Advanced)
- **Deal type:** Litigation settlement
- **You are:** Plaintiff's counsel in a breach of contract + IP misappropriation case
- **They are:** Defense counsel for a mid-size tech company
- **Core tension:** Settlement amount ($500K-$2M range), injunctive relief, non-disparagement, admission vs. no-admission, payment structure
- **Concepts taught:** ZOPA identification, credible threats, timing leverage, client management (your client wants their day in court)
- **Rounds:** 8

### Scenario content notes:
- All scenarios are US-general (no jurisdiction-specific law)
- No real company names. All fictional.
- Dialogue should feel realistic — terse, slightly adversarial, professional. Not overly formal.
- Each option should represent a genuinely different strategic approach, not just tone variations.

---

## 7. File Structure

```
closing-table/
├── app/
│   ├── layout.tsx                  # Root layout (dark theme, fonts, metadata)
│   ├── page.tsx                    # Home / scenario select
│   ├── play/
│   │   └── [scenarioId]/
│   │       └── page.tsx            # Game screen (briefing → rounds → scorecard)
│   └── globals.css
├── components/
│   ├── ScenarioCard.tsx            # Card on home screen
│   ├── Briefing.tsx                # Pre-game briefing
│   ├── NegotiationRound.tsx        # Round display with dialogue + options
│   ├── MeterDisplay.tsx            # The four animated meters
│   ├── Scorecard.tsx               # End-of-game results
│   ├── ShareButton.tsx             # Social sharing
│   ├── OptionCard.tsx              # Individual choice button
│   └── ProgressBar.tsx             # Round X of Y
├── data/
│   └── scenarios/
│       ├── startup-acquisition.json
│       ├── commercial-lease.json
│       └── settlement-conference.json
├── lib/
│   ├── gameEngine.ts               # State machine logic, meter calculations
│   ├── grading.ts                  # Score calculation, style analysis
│   └── scenarios.ts                # Scenario loading utilities
├── types/
│   └── scenario.ts                 # All TypeScript interfaces (from Section 4)
├── public/
│   ├── og-image.png                # Open Graph image for social sharing
│   └── favicon.ico
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. Implementation Order

Build in this order. Each phase should be deployable.

### Phase 1: Skeleton + One Scenario (Day 1)
1. `npx create-next-app@latest closing-table --typescript --tailwind --app`
2. Define all TypeScript interfaces in `/types/scenario.ts`
3. Build `gameEngine.ts` — the pure function state machine (takes state + choice, returns new state)
4. Write `startup-acquisition.json` — the first scenario (6 rounds, 3 options each, 3 endings)
5. Build the `play/[scenarioId]/page.tsx` with all game screens (briefing, rounds, scorecard)
6. Build `MeterDisplay.tsx` with animated bars
7. Build `NegotiationRound.tsx` with option cards
8. Deploy to Vercel

### Phase 2: Polish + Home Screen (Day 2)
1. Build home page with scenario cards
2. Build `Scorecard.tsx` with grading, key moments, negotiation style
3. Build `ShareButton.tsx` (Twitter/LinkedIn text generation)
4. Add transitions/animations between rounds (fade or slide)
5. Mobile responsive pass
6. OG image + meta tags for social sharing

### Phase 3: More Scenarios (Day 3)
1. Write `commercial-lease.json`
2. Write `settlement-conference.json`
3. Test all three scenarios end-to-end
4. Add difficulty badges to scenario cards

### Phase 4 (Future / v2 — not in scope now)
- AI counterpart mode (LLM plays the other side, free-text input)
- Leaderboard (would need a backend)
- User-submitted scenarios
- Multiplayer (two players negotiate against each other)
- Timer mode (30 seconds per choice)

---

## 9. Key Engineering Decisions

### 9.1 No AI in v1
All scenarios are hand-authored branching trees. This is intentional:
- Zero cost to run
- Predictable, testable, no hallucination risk
- Allows carefully crafted educational feedback per choice
- AI mode is a natural v2 upsell

### 9.2 No Backend
- Scenario data ships as static JSON imported at build time
- Game state lives entirely in React state
- No localStorage (can break in some environments)
- Shareability is via generated text, not saved URLs

### 9.3 Meter Clamping
All meter values are clamped to 0-100 after every update. Never display negative or >100.

```typescript
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
```

### 9.4 Feedback Timing
After the player selects an option:
1. Show the `feedback` text for that option (if present) for ~2 seconds with a subtle highlight
2. Animate meter changes
3. After animation completes (~800ms), auto-advance to next round
4. On terminal nodes, transition to scorecard

### 9.5 URL Structure
- `/` — home/scenario select
- `/play/startup-acquisition` — plays that scenario
- No other routes needed for v1

---

## 10. Content Guidelines for Writing Scenarios

When writing new scenario JSON files, follow these rules:

1. **Options must be strategically distinct.** "Agree politely" vs. "Agree firmly" is bad. "Concede on price but demand better terms" vs. "Hold firm on price and risk walkaway" is good.

2. **Every option should be defensible.** No obviously wrong answers. The "aggressive" option should sometimes be the best move. The "nice" option should sometimes backfire.

3. **Narration should be concise.** Max 3 sentences per narration block. This is a game, not a novel.

4. **Feedback should teach.** Reference real negotiation concepts: anchoring, BATNA, ZOPA, logrolling, nibble technique, good cop/bad cop, deadline pressure, bracketing.

5. **Meter effects should be proportional.** Typical delta is ±5 to ±15. A +25 or -25 should only happen on truly pivotal moments.

6. **Terminal nodes need outcome narratives.** Write 3-5 sentences describing what happened after the negotiation. Did the deal close? How does each side feel? What are the long-term consequences?

7. **No legal advice.** The game teaches negotiation *strategy*, not law. No jurisdiction-specific content.

---

## 11. SEO / Social / Marketing

- **Title tag:** "Closing Table — The Deal Negotiation Game | Free Browser Game"
- **Description:** "Practice real-world negotiation skills in high-stakes deal scenarios. Free, no signup. By Lawyered."
- **OG Image:** Dark background, game title, a sample meter display. Make it look like a game screenshot.
- **Target keywords:** negotiation game, deal negotiation practice, free negotiation simulator, negotiation training game
- **Social sharing format:** "I scored [grade] on '[scenario name]' at Closing Table 🤝 Can you close a better deal? [link]"

---

## 12. Definition of Done (v1 MVP)

- [ ] Home screen with 3 scenario cards
- [ ] Full game loop works: briefing → rounds → scorecard
- [ ] 4 animated meters update in real time
- [ ] 3 complete scenarios (startup acquisition, commercial lease, settlement)
- [ ] Letter grading + negotiation style label on scorecard
- [ ] Key moments breakdown on scorecard
- [ ] Share button generates copyable text
- [ ] Mobile responsive (playable on phone)
- [ ] Deployed to Vercel with custom domain or subdomain
- [ ] OG meta tags work (test with Twitter Card Validator)
- [ ] README.md in repo

---

## 13. Stretch Goals (not required for MVP)

- Sound effects (subtle click on option select, "ding" on good move)
- Keyboard navigation (1/2/3/4 to select options)
- "Negotiation concepts" glossary page (`/learn`)
- Scenario difficulty filter on home page
- Confetti animation on A+ grade
- Dark/light theme toggle
