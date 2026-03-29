# Changelog

All notable changes to Kinship will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial CLI with add, list, log, search, decay commands
- Web UI with contact list, detail view, and add form
- Network graph visualization with react-force-graph-2d
- Semantic search using Google Gemini embeddings
- Warmth decay system with configurable tiers
- Supabase database schema with pgvector

### Database Schema
- `persons` — Core contact information
- `organizations` — Companies and groups
- `person_organizations` — Employment/membership links
- `interactions` — Meeting, call, email logs
- `relationships` — Person-to-person connections
- `life_events` — Birthdays, milestones
- `contexts` — How you know someone
- `person_contexts` — Context links

## [0.1.0] - 2026-03-29

### Added
- Initial release
- CLI package (`@kinship/cli`)
- Web package (`@kinship/web`)
- Database migrations

[Unreleased]: https://github.com/zenpierce27/kinship/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/zenpierce27/kinship/releases/tag/v0.1.0
