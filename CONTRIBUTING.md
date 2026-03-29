# Contributing to Kinship

Thanks for your interest in contributing! Kinship is an open-source relationship intelligence platform.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account (for database)
- Google AI API key (for embeddings)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/zenpierce27/kinship.git
   cd kinship
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   export KINSHIP_SUPABASE_URL="your-supabase-url"
   export KINSHIP_SUPABASE_ANON_KEY="your-anon-key"
   export KINSHIP_SUPABASE_SERVICE_KEY="your-service-key"
   export GEMINI_API_KEY="your-gemini-key"
   ```

4. Run database migrations:
   ```bash
   # Apply via Supabase dashboard or CLI
   ```

5. Run the CLI:
   ```bash
   cd packages/cli
   npx tsx src/index.ts --help
   ```

6. Run the web UI:
   ```bash
   cd packages/web
   pnpm dev
   ```

## Project Structure

```
kinship/
├── packages/
│   ├── cli/          # Command-line interface
│   └── web/          # Next.js web application
├── supabase/
│   └── migrations/   # Database schema
└── docs/             # Documentation
```

## How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker
- Include steps to reproduce
- Include expected vs actual behavior

### Suggesting Features

- Open an issue with the "enhancement" label
- Describe the use case and benefit

### Submitting Code

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit with clear messages
6. Push and open a PR

### Code Style

- TypeScript for all new code
- Use existing patterns in the codebase
- Add types, avoid `any`

## Areas to Contribute

- 🔌 **Integrations** — LinkedIn, Google Contacts, etc.
- 📱 **Mobile app** — React Native wrapper
- 🔍 **Better search** — More embedding models
- 📊 **Analytics** — Network insights
- 🎨 **UI/UX** — Design improvements

## License

By contributing, you agree that your contributions will be licensed under MIT.
