# Smith Daily News Platform — Architecture

## Overview

Multi-user platform that aggregates updates from users' connected tools (AI assistants, Slack, Email, Calendar, Task managers), builds personalized topic-based "memory" feeds, and generates daily Smith Daily News digests.

**Stack:** Next.js 14 (App Router) + Firebase (Auth + Firestore) + Tailwind CSS + Docker (self-hosted VPS)

---

## Project Structure

```
ai-news-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (AuthProvider, theme)
│   │   ├── page.tsx                  # Landing / marketing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # SSO login page
│   │   │   └── callback/page.tsx     # OAuth callback handler
│   │   ├── (dashboard)/              # Protected routes (requires auth)
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx              # Dashboard home → today's digest
│   │   │   ├── digest/
│   │   │   │   ├── page.tsx          # Latest digest
│   │   │   │   └── [date]/page.tsx   # Historical digest by date
│   │   │   ├── topics/
│   │   │   │   ├── page.tsx          # Topic management
│   │   │   │   └── [id]/page.tsx     # Single topic detail + updates
│   │   │   ├── connectors/
│   │   │   │   ├── page.tsx          # Connector dashboard
│   │   │   │   └── [provider]/
│   │   │   │       └── callback/page.tsx  # Per-provider OAuth callback
│   │   │   └── settings/
│   │   │       └── page.tsx          # User settings, preferences
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...provider]/route.ts  # OAuth initiation routes
│   │       ├── connectors/
│   │       │   ├── route.ts                # CRUD connectors
│   │       │   ├── [provider]/
│   │       │   │   ├── auth/route.ts       # Start OAuth for connector
│   │       │   │   ├── callback/route.ts   # OAuth callback
│   │       │   │   └── sync/route.ts       # Manual sync trigger
│   │       ├── topics/
│   │       │   ├── route.ts                # CRUD topics
│   │       │   └── [id]/updates/route.ts   # Get topic updates
│   │       ├── digest/
│   │       │   ├── route.ts                # Get/generate digest
│   │       │   └── generate/route.ts       # Trigger digest generation
│   │       └── cron/
│   │           ├── morning/route.ts        # 6am cron endpoint
│   │           └── midday/route.ts         # 12pm cron endpoint
│   ├── components/
│   │   ├── ui/                       # Base UI components (Button, Card, Modal, etc.)
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx       # Firebase Auth context
│   │   │   ├── LoginForm.tsx          # SSO buttons
│   │   │   └── ProtectedRoute.tsx     # Auth guard
│   │   ├── connectors/
│   │   │   ├── ConnectorCard.tsx      # Single connector status card
│   │   │   ├── ConnectorGrid.tsx      # Grid of all connectors
│   │   │   └── OAuthButton.tsx        # Start OAuth flow button
│   │   ├── topics/
│   │   │   ├── TopicCard.tsx
│   │   │   ├── TopicForm.tsx          # Create/edit topic
│   │   │   └── UpdateFeed.tsx         # Topic update timeline
│   │   ├── digest/
│   │   │   ├── DigestView.tsx         # Full digest renderer
│   │   │   ├── HeroCard.tsx
│   │   │   ├── StoryCard.tsx
│   │   │   ├── BriefingList.tsx
│   │   │   ├── TechDeepDive.tsx
│   │   │   ├── RepoGrid.tsx
│   │   │   └── DigestFooter.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Topbar.tsx
│   │       └── DashboardShell.tsx
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts              # Firebase app init
│   │   │   ├── auth.ts                # Auth helpers
│   │   │   ├── firestore.ts           # Firestore helpers
│   │   │   └── admin.ts               # Firebase Admin SDK (server-side)
│   │   ├── connectors/
│   │   │   ├── registry.ts            # Connector registry & metadata
│   │   │   ├── base.ts                # BaseConnector abstract class
│   │   │   ├── ai/
│   │   │   │   ├── claude.ts          # Claude API connector
│   │   │   │   ├── chatgpt.ts         # ChatGPT connector
│   │   │   │   ├── gemini.ts          # Gemini connector
│   │   │   │   └── grok.ts            # Grok connector
│   │   │   ├── communication/
│   │   │   │   ├── slack.ts           # Slack OAuth + API
│   │   │   │   ├── teams.ts           # Microsoft Teams
│   │   │   │   ├── google-chat.ts     # Google Chat
│   │   │   │   └── lark.ts            # Lark/Feishu
│   │   │   ├── email/
│   │   │   │   ├── gmail.ts           # Gmail OAuth + API
│   │   │   │   └── outlook.ts         # Outlook OAuth + API
│   │   │   ├── calendar/
│   │   │   │   ├── google-calendar.ts
│   │   │   │   └── outlook-calendar.ts
│   │   │   └── tasks/
│   │   │       ├── jira.ts            # Atlassian Jira
│   │   │       ├── trello.ts          # Trello
│   │   │       └── linear.ts          # Linear
│   │   ├── topics/
│   │   │   ├── engine.ts              # Topic matching & relevance scoring
│   │   │   └── updater.ts             # Fetch updates for topics from connectors
│   │   ├── digest/
│   │   │   ├── generator.ts           # Digest generation pipeline
│   │   │   ├── ranker.ts              # Story ranking by topic relevance
│   │   │   └── formatter.ts           # Format digest data for rendering
│   │   ├── cron/
│   │   │   ├── scheduler.ts           # node-cron setup
│   │   │   ├── morning-job.ts         # 6am job logic
│   │   │   └── midday-job.ts          # 12pm job logic
│   │   └── utils/
│   │       ├── crypto.ts              # Token encryption/decryption
│   │       ├── date.ts                # Date helpers
│   │       └── errors.ts              # Error handling
│   ├── types/
│   │   ├── connector.ts               # Connector types
│   │   ├── topic.ts                   # Topic types
│   │   ├── digest.ts                  # Digest types
│   │   └── user.ts                    # User types
│   └── styles/
│       ├── globals.css                # Tailwind + design tokens
│       └── digest.css                 # Digest-specific styles (ported from existing)
├── public/
│   ├── favicon.png                    # Existing favicon
│   └── icons/                         # Connector brand icons
├── cron/
│   └── worker.ts                      # Standalone cron worker process
├── docker/
│   ├── Dockerfile                     # Multi-stage Next.js build
│   ├── Dockerfile.cron                # Cron worker container
│   └── nginx.conf                     # Nginx reverse proxy config
├── docker-compose.yml
├── .env.example
├── .env.local                         # Local dev (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── ARCHITECTURE.md
```

---

## Firestore Schema

### Collections

```
users/{uid}
  ├── email: string
  ├── displayName: string
  ├── photoURL: string
  ├── provider: "google" | "github" | "microsoft" | "apple"
  ├── preferences: {
  │     timezone: string (default "Asia/Ho_Chi_Minh")
  │     language: "vi" | "en"
  │     digestTime: { morning: "06:00", midday: "12:00" }
  │     focusAreas: string[] (e.g. ["agentic-memory", "llm-cost", "frontier-models"])
  │   }
  ├── createdAt: timestamp
  └── updatedAt: timestamp

users/{uid}/connectors/{connectorId}
  ├── provider: string (e.g. "slack", "gmail", "claude")
  ├── category: "ai" | "communication" | "email" | "calendar" | "tasks"
  ├── status: "connected" | "disconnected" | "error" | "expired"
  ├── accessToken: string (encrypted)
  ├── refreshToken: string (encrypted)
  ├── tokenExpiresAt: timestamp
  ├── scopes: string[]
  ├── metadata: { workspace?, email?, teamName? }
  ├── lastSyncAt: timestamp
  └── connectedAt: timestamp

users/{uid}/topics/{topicId}
  ├── name: string
  ├── description: string
  ├── keywords: string[] (matching terms)
  ├── sources: string[] (which connectors to watch)
  ├── isActive: boolean
  ├── priority: "high" | "medium" | "low"
  ├── createdAt: timestamp
  └── updatedAt: timestamp

users/{uid}/topics/{topicId}/updates/{updateId}
  ├── source: string (connector provider)
  ├── sourceId: string (original message/email/task ID)
  ├── title: string
  ├── summary: string
  ├── url: string (deep link back to source)
  ├── relevanceScore: number (0-1)
  ├── metadata: { channel?, sender?, project?, labels? }
  ├── fetchedAt: timestamp
  └── readAt: timestamp | null

users/{uid}/digests/{date}  (date = "2026-05-28")
  ├── issueNumber: number
  ├── generatedAt: timestamp
  ├── updatedAt: timestamp (midday update)
  ├── status: "generating" | "ready" | "error"
  ├── stories: Story[]
  ├── repos: Repo[]
  ├── stats: { totalStories, sourcesQueried, topicsMatched }
  └── signalSources: string[] (connectors used)
```

---

## Connector Architecture

### BaseConnector Interface

```typescript
interface ConnectorConfig {
  id: string;
  name: string;
  category: ConnectorCategory;
  icon: string;
  description: string;
  oauth: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnv: string;
    clientSecretEnv: string;
  };
}

abstract class BaseConnector {
  abstract getAuthUrl(state: string): string;
  abstract exchangeCode(code: string): Promise<TokenPair>;
  abstract refreshToken(refreshToken: string): Promise<TokenPair>;
  abstract fetchUpdates(accessToken: string, since: Date): Promise<Update[]>;
  abstract testConnection(accessToken: string): Promise<boolean>;
}
```

### Connector Categories & Providers

| Category | Providers | OAuth | Data Fetched |
|----------|-----------|-------|-------------|
| **AI Tools** | Claude, ChatGPT, Gemini, Grok | API Key + OAuth where available | Conversation history, memory, preferences |
| **Communication** | Slack, Teams, Google Chat, Lark | OAuth 2.0 | Messages, channels, mentions, threads |
| **Email** | Gmail, Outlook | OAuth 2.0 | Emails, labels, threads (filtered by topics) |
| **Calendar** | Google Calendar, Outlook Calendar | OAuth 2.0 | Events, meetings, agendas |
| **Tasks** | Jira, Trello, Linear | OAuth 2.0 | Issues, boards, sprints, updates |

---

## Cron System

Self-hosted cron worker runs as a separate Docker container alongside the Next.js app.

### Morning Job (6:00 AM user-local)
1. Query all active users
2. For each user (parallel, batched):
   a. Refresh expired connector tokens
   b. Fetch updates from all connected sources (last 24h, or 48h on Monday)
   c. Match updates against user's topics → compute relevance scores
   d. Store updates in Firestore
   e. Generate personalized digest (ranked stories, repos, deep-dives)
   f. Store digest in `users/{uid}/digests/{date}`

### Midday Job (12:00 PM user-local)
1. Same flow but only fetches new updates since morning
2. Updates existing digest (appends new stories, re-ranks)
3. Marks digest as "updated"

### Implementation
- **node-cron** for scheduling in the cron worker container
- Jobs call internal API endpoints (`/api/cron/morning`, `/api/cron/midday`) with a shared secret
- Bull/BullMQ with Redis for job queuing (handles retries, concurrency)

---

## Security

- **Token encryption:** AES-256-GCM for all OAuth tokens stored in Firestore
- **Environment secrets:** All OAuth client secrets, Firebase admin key, encryption key in `.env`
- **API protection:** Cron endpoints require `X-Cron-Secret` header
- **CORS:** Restricted to platform domain
- **Rate limiting:** Per-user rate limits on connector syncs

---

## Design System

Inherits from existing Smith Daily News digest:
- Dark theme: `--bg: #07070a`, surfaces `--s1` through `--s4`
- Gold accent: `--gold: #c8a76a` for primary actions
- Blue: `--blue: #5d8dee` for info/links
- Teal: `--teal: #3ecf8e` for success/positive
- Red: `--red: #e55252` for alerts/breaking
- Purple: `--purple: #9d78f0` for AI/special
- Typography: Inter/system-ui, tight tracking
- Border radius: 12px
- Animations: fadeUp, borderShift, countGlow

---

## Docker Deployment

```yaml
services:
  app:        # Next.js production server (port 3000)
  cron:       # Cron worker (node-cron + job processor)
  redis:      # Job queue backend
  nginx:      # Reverse proxy + SSL termination
```
