# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-21

### Added

- CLI: `init`, `exec`, `sessions`, `show`, `replay`, `report`, `policy check`, `doctor`
- `exec` wrapper adapter: runs any shell command inside the AgentGuard boundary (works with any AI agent)
- Policy engine with YAML policies: shell allow/deny/ask globs, protected filesystem paths, allowlist mode
- Built-in dangerous command detection: pipe-to-shell, fork bombs, raw disk writes, root deletion, sudo, registry edits, and more
- Secret detection for AWS, GitHub, OpenAI, Anthropic, Slack, Google, Stripe credentials, private key blocks, JWTs, and high-entropy assignments; automatic redaction before storage
- Interactive approval prompts (allow once / allow for session / deny); non-interactive sessions deny by default
- Session recording as local JSONL event streams with git-based file change tracking
- Session replay timeline and security reports in text and Markdown formats
- Deterministic, explainable risk scoring
- 37 automated tests including an end-to-end CLI test

### Known limitations

- File change tracking requires a git repository (snapshot diffing, not OS-level interception)
- Network policy is accepted in configuration but not yet enforced; `policy check` warns about this
- AgentGuard is a userspace boundary, not a sandbox
