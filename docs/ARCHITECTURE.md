# Kinship Architecture

## Overview

Kinship is a monorepo containing two packages:
- `@kinship/cli` - Command-line interface
- `@kinship/web` - Next.js web application

Both packages share a common Supabase backend.

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         PERSONS                                  │
│  id, name, email, phone, warmth_tier, last_contact, embedding   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                     │
         │ 1:N                │ M:N                 │ M:N
         ▼                    ▼                     ▼
┌─────────────┐    ┌──────────────────────┐    ┌─────────────┐
│ INTERACTIONS│    │ PERSON_ORGANIZATIONS │    │ RELATIONSHIPS│
│ (log calls, │    │ (work history)       │    │ (who knows  │
│  meetings)  │    │                      │    │  whom)      │
└─────────────┘    └──────────────────────┘    └─────────────┘
                            │
                            │ N:1
                            ▼
                   ┌─────────────────┐
                   │  ORGANIZATIONS  │
                   │  (companies)    │
                   └─────────────────┘
```

### Tables

| Table | Purpose |
|-------|---------|
| persons | Core contact data + embedding vector |
| organizations | Companies, groups, institutions |
| person_organizations | Employment/membership links |
| interactions | Call, meeting, email logs |
| relationships | Person-to-person connections |
| life_events | Birthdays, milestones |
| contexts | How/where you met |
| person_contexts | Context links |

## Semantic Search

1. User enters query ("who works in AI?")
2. Query is embedded via Gemini API
3. Vector similarity search against `persons.embedding`
4. Results ranked by cosine similarity

```typescript
// Embedding flow
const queryEmbedding = await embed(query); // 1536 dims
const results = await supabase.rpc('match_persons', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 10
});
```

## Warmth Decay

Each tier has a decay period. If `last_contact` exceeds the period, the relationship "cools":

```typescript
const DECAY_DAYS = {
  inner_circle: 30,
  close_friend: 60,
  friend: 90,
  colleague: 120,
  contact: 180,
  acquaintance: 365,
};
```

The `decay` command checks all contacts and flags those needing attention.

## CLI Package

```
packages/cli/
├── src/
│   ├── index.ts           # Entry point, Commander setup
│   ├── commands/
│   │   ├── add.ts         # Add contact
│   │   ├── list.ts        # List contacts
│   │   ├── log.ts         # Log interaction
│   │   ├── search.ts      # Semantic search
│   │   ├── decay.ts       # Check warmth decay
│   │   └── embed-stale.ts # Re-embed stale contacts
│   └── lib/
│       ├── supabase.ts    # DB client
│       ├── embeddings.ts  # Gemini API
│       └── config.ts      # Environment config
└── package.json
```

## Web Package

```
packages/web/
├── src/
│   ├── app/
│   │   ├── page.tsx       # Contact list
│   │   ├── add/           # Add contact form
│   │   ├── contact/[id]/  # Contact detail
│   │   └── graph/         # Network visualization
│   ├── components/
│   │   └── NetworkGraph.tsx
│   └── lib/
│       └── supabase.ts
└── package.json
```

## Data Flow

```
User Action → CLI/Web → Supabase API → PostgreSQL
                ↓
           Gemini API (embeddings)
```

## Security

- Row Level Security (RLS) on all tables
- User ID required for all operations
- API keys via environment variables
- No personal data in repository
