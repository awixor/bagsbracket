# BagsBracket

**March Madness for crypto tokens — powered by [Bags.fm](https://bags.fm)**

Bags.fm token creators submit their tokens to compete in head-to-head elimination brackets. Each 24-hour match is decided by real onchain trading volume (85%) + community votes (15%). The bracket champion gets featured on the homepage.

Live at **[bagsbracket.xyz](https://bagsbracket.xyz)**

---

## How it works

1. **Register** — Token creators submit their Bags.fm mint address. Admin reviews and approves.
2. **Bracket launches** — Every 8 approved tokens trigger a new tournament automatically.
3. **Compete** — Tokens face off in 24-hour matches. Higher composite score (volume + votes) advances.
4. **Vote** — Connect a Solana wallet to vote once per match. Votes carry 15% weight.
5. **Win** — Tournament champion is featured on the BagsBracket homepage.

Multiple tournaments can run simultaneously.

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Blockchain:** Solana — wallet connect via `@solana/wallet-adapter`
- **Data:** Bags.fm API + Dexscreener for live token volume and metadata
- **Storage:** Vercel KV (Redis) for tournament state and vote deduplication
- **Deployment:** Vercel

---

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in your env vars
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

| Variable | Description |
|---|---|
| `KV_URL` | Vercel KV connection URL |
| `KV_REST_API_URL` | Vercel KV REST endpoint |
| `KV_REST_API_TOKEN` | Vercel KV read/write token |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV read-only token |
| `ADMIN_SECRET` | Secret header value for admin API routes |
| `BAGS_API_KEY` | Bags.fm API key (optional — Dexscreener fallback used without it) |

---

## Project structure

```
app/
  page.tsx                  # Homepage — active tournaments + winner banner
  bracket/[id]/page.tsx     # Individual bracket view (server wrapper + live client)
  tournaments/page.tsx      # All tournaments list with Live/Past filters
  register/page.tsx         # Token registration form
  admin/page.tsx            # Admin panel (approve tokens, launch/resolve tournaments)
  api/
    tournament/[id]/        # GET tournament by ID, POST vote
    register/               # POST token registration
    admin/                  # GET/PATCH registration queue
    admin/launch/           # POST launch new tournament
    admin/resolve/          # POST resolve current round
components/
  BracketClient.tsx         # Live-polling bracket UI (client component)
  Bracket.tsx               # Bracket tree with SVG connectors
  MatchCard.tsx             # Head-to-head match card with composite score
  TournamentList.tsx        # Tournament list with All/Live/Past tabs
  WalletButton.tsx          # Solana wallet connect
lib/
  bags.ts                   # Bags.fm + Dexscreener API client
  tournament.ts             # Bracket seeding, match resolution (85/15 scoring)
  kv.ts                     # Vercel KV helpers — tournaments, votes, registrations
```

---

## Admin workflow

All admin routes require the `x-admin-secret` header matching `ADMIN_SECRET`.

```bash
# Approve a registration
PATCH /api/admin  { "id": "<reg-id>", "status": "approved" }

# Launch a new tournament (requires 8 approved tokens in queue)
POST /api/admin/launch

# Resolve current round (advances winners, completes tournament on final round)
POST /api/admin/resolve  { "tournamentId": "<id>" }
```

---

## Scoring

Each match is resolved by a composite score:

```
score = 0.85 × (volume growth share) + 0.15 × (vote share)
```

Volume growth is measured as the ratio of each token's trading volume since match start relative to its baseline — so absolute volume size doesn't matter, only growth rate.

---

## Deployment

```bash
vercel --prod
```

Set all environment variables in the Vercel dashboard. Vercel KV can be provisioned directly from the dashboard under Storage.
