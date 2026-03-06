# BagsBracket — CLAUDE.md

## Project Overview

BagsBracket is a head-to-head token elimination tournament built on top of Bags.fm (Solana).
Tokens compete in bracket-style rounds determined by trading volume over a set time window.
Creators campaign for their tokens, driving real trading volume — which is the core metric Bags.fm rewards.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Blockchain:** Solana (wallet connect via @solana/wallet-adapter)
- **Data:** Bags.fm public API for token price, volume, holders
- **Deployment:** Vercel

## Project Structure

```
bagsbracket/
├── app/
│   ├── page.tsx              # Landing page + active tournament
│   ├── bracket/[id]/page.tsx # Individual bracket view
│   ├── token/[mint]/page.tsx # Token detail page
│   └── api/
│       ├── tournament/route.ts  # Tournament state CRUD
│       └── tokens/route.ts      # Bags.fm token data proxy
├── components/
│   ├── Bracket.tsx           # Main bracket tree UI
│   ├── MatchCard.tsx         # Single head-to-head match
│   ├── TokenCard.tsx         # Token info + trade button
│   ├── Leaderboard.tsx       # Current round standings
│   └── WalletButton.tsx      # Solana wallet connect
├── lib/
│   ├── bags.ts               # Bags.fm API client
│   ├── tournament.ts         # Bracket logic (seeding, advancement)
│   └── solana.ts             # Wallet + on-chain helpers
├── types/
│   └── index.ts              # Token, Match, Tournament types
└── CLAUDE.md
```

## Core Features (MVP)

### 1. Bracket UI

- Support 8-token and 16-token brackets
- Visual tree layout showing all rounds (Quarterfinals → Semis → Final)
- Highlight current active matches
- Show winner advancement with animation
- Each matchup shows: token logo, name, current volume, % change

### 2. Token Data (via Bags.fm API)

- Fetch token metadata: name, symbol, logo, mint address
- Fetch live trading data: volume (24h), price, holder count, market cap
- Poll every 60 seconds during active matches
- Winner = token with higher trading volume over the match window (e.g. 24 hrs)

### 3. Wallet Integration

- Connect Solana wallet (Phantom, Backpack, Solflare)
- Wallet-signed community votes (1 vote per wallet per match)
- Vote weight: 1 token hold = 1 vote (optional enhancement)

### 4. Tournament Lifecycle

- **Registration:** Token creators submit their mint address to enter
- **Seeding:** Tokens seeded by current holder count or market cap
- **Rounds:** Each round runs for 24 hours
- **Advancement:** Top trading volume in each matchup advances
- **Final:** Winner gets featured banner on BagsBracket homepage

### 5. Trade Embed

- Embed Bags.fm trade widget or deep-link to bags.fm/token/[mint]
- "Trade to support" CTA on each token card during active match

## Key Data Types

```typescript
type Token = {
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  volume24h: number;
  price: number;
  holders: number;
  marketCap: number;
};

type Match = {
  id: string;
  round: number;
  tokenA: Token;
  tokenB: Token;
  startTime: Date;
  endTime: Date;
  winnerId?: string;
  volumeA: number;
  volumeB: number;
  votesA: number;
  votesB: number;
};

type Tournament = {
  id: string;
  name: string;
  size: 8 | 16;
  status: "registration" | "active" | "completed";
  matches: Match[];
  currentRound: number;
  createdAt: Date;
};
```

## Bags.fm API Integration

```typescript
// lib/bags.ts

const BAGS_API = "https://api.bags.fm"; // confirm actual base URL

export async function getToken(mint: string): Promise<Token> {
  const res = await fetch(`${BAGS_API}/token/${mint}`);
  return res.json();
}

export async function getTokenVolume(
  mint: string,
  since: Date,
): Promise<number> {
  const res = await fetch(
    `${BAGS_API}/token/${mint}/volume?since=${since.toISOString()}`,
  );
  const data = await res.json();
  return data.volume;
}

export async function searchTokens(query: string): Promise<Token[]> {
  const res = await fetch(`${BAGS_API}/tokens/search?q=${query}`);
  return res.json();
}
```

> ⚠️ Confirm actual Bags.fm API endpoints before building. Check https://bags.fm/docs or inspect network requests on bags.fm.

## Bracket Logic

```typescript
// lib/tournament.ts

export function seedBracket(tokens: Token[]): Match[] {
  // Sort by holder count descending, pair 1v8, 2v7, 3v6, 4v5
  const sorted = [...tokens].sort((a, b) => b.holders - a.holders);
  const matches: Match[] = [];
  const half = sorted.length / 2;
  for (let i = 0; i < half; i++) {
    matches.push(
      createMatch(sorted[i], sorted[sorted.length - 1 - i], (round = 1)),
    );
  }
  return matches;
}

export function resolveMatch(match: Match): string {
  // Volume-based winner, fall back to votes if tied
  if (match.volumeA !== match.volumeB) {
    return match.volumeA > match.volumeB
      ? match.tokenA.mint
      : match.tokenB.mint;
  }
  return match.votesA >= match.votesB ? match.tokenA.mint : match.tokenB.mint;
}
```

## UI Guidelines

- Color scheme: dark background (#0a0a0a), gold accents (#f5c542) for winners, red/green for volume changes
- Bracket lines: SVG connectors between match cards
- Mobile: collapse bracket to vertical list of matches per round with tab navigation
- Animations: use Framer Motion for match resolution reveals

## State Management

- Use React `useState` + `useEffect` for bracket state (no heavy state library needed for MVP)
- Store tournament state server-side in a simple JSON file or Vercel KV for persistence
- Poll Bags.fm API client-side every 60s during active matches

## Commands

```bash
# Install
pnpm install

# Dev server
pnpm dev

# Build
pnpm build

# Deploy
vercel --prod
```

## GitHub Workflow — Repo Setup & Incremental Commits

### Step 1: Create the repo (run once at the start)

```bash
gh repo create bagsbracket --public --description "Token elimination tournament on Bags.fm" --clone
cd bagsbracket
```

### Step 2: Initialize the Next.js project inside the cloned repo

```bash
pnpm dlx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
git add .
git commit -m "chore: init Next.js project with TypeScript and Tailwind"
git push origin main
```

### Step 3: Commit piece by piece as you build

After completing EACH of the following units of work, stage and commit immediately.
Never batch multiple features into one commit.

```bash
# After setting up types
git add types/
git commit -m "feat: add Token, Match, Tournament TypeScript types"
git push origin main

# After Bags.fm API client
git add lib/bags.ts
git commit -m "feat: add Bags.fm API client (getToken, getTokenVolume, searchTokens)"
git push origin main

# After bracket logic
git add lib/tournament.ts
git commit -m "feat: add bracket seeding and match resolution logic"
git push origin main

# After WalletButton component
git add components/WalletButton.tsx
git commit -m "feat: add Solana wallet connect button"
git push origin main

# After TokenCard component
git add components/TokenCard.tsx
git commit -m "feat: add TokenCard component with live volume display"
git push origin main

# After MatchCard component
git add components/MatchCard.tsx
git commit -m "feat: add MatchCard head-to-head comparison UI"
git push origin main

# After Bracket component
git add components/Bracket.tsx
git commit -m "feat: add Bracket tree UI with SVG connectors"
git push origin main

# After Leaderboard component
git add components/Leaderboard.tsx
git commit -m "feat: add Leaderboard component for current round standings"
git push origin main

# After API routes
git add app/api/
git commit -m "feat: add tournament and token API routes"
git push origin main

# After main bracket page
git add app/bracket/
git commit -m "feat: add bracket page with live polling"
git push origin main

# After landing page
git add app/page.tsx
git commit -m "feat: add landing page with active tournament CTA"
git push origin main

# After styling polish
git add .
git commit -m "style: dark theme, gold accents, Framer Motion animations"
git push origin main

# After Vercel deployment config
git add vercel.json
git commit -m "chore: add Vercel deployment config"
git push origin main
```

### Commit Message Convention

Always follow this format:

- `feat:` — new feature or component
- `fix:` — bug fix
- `chore:` — setup, config, dependencies
- `style:` — UI/CSS only changes
- `refactor:` — restructuring without behavior change

### Branch Strategy (optional but recommended)

```bash
# Work on a feature branch
git checkout -b feat/bracket-ui

# After finishing, merge to main
git checkout main
git merge feat/bracket-ui
git push origin main
```

## MVP Scope (Hackathon)

Focus only on these for submission:

- [x] Bracket UI with 8 tokens
- [x] Live volume data from Bags.fm
- [x] Wallet connect
- [x] Community votes
- [x] One completed example tournament (hardcoded or seeded data)
- [x] Deploy on Vercel with custom domain (bagsbracket.xyz)

## Out of Scope (Post-hackathon)

- On-chain escrow for prize pools
- Token creator registration flow
- Historical tournament archive
- Mobile app
- Smart contract for trustless winner resolution

## Hackathon Submission Notes

- Emphasize: drives real trading volume on Bags.fm (core platform metric)
- Demo: show a live or simulated bracket with real Bags.fm tokens
- Pitch angle: "March Madness for crypto tokens"
- Link to bags.fm/hackathon submission form when ready
