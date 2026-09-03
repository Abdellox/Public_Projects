<div align="center">

# Awesome AI Coding

### The one-stop collection of configs, skills, workflows & tools for every AI coding agent

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**Claude Code**](#claude-code) | [**OpenAI Codex**](#openai-codex) | [**Gemini CLI**](#gemini-cli) | [**OpenCode**](#opencode) | [**Cursor**](#cursor) | [**Windsurf**](#windsurf) | [**Cline**](#cline)

---

*Stop configuring. Start shipping. One command sets up your entire AI coding stack.*

</div>

---

## Why This Exists

Every developer using AI coding agents wastes **hours** configuring settings, hunting for the best MCP servers, and figuring out optimal workflows. This repo fixes that.

**What you get:**
- Curated configs for every major AI coding agent
- Best MCP servers ranked by community usage
- Production-tested workflows and skills
- One-command setup for your entire stack

## Quick Start

```bash
# Set up all your AI coding agents in one go
npx awesome-ai-coding setup

# Or install specific agent configs
npx awesome-ai-coding setup --agent claude
npx awesome-ai-coding setup --agent codex
npx awesome-ai-coding setup --agent gemini
```

## What's Inside

| Section | Description |
|---------|-------------|
| [Agent Configs](#agent-configs) | Production-ready settings for every AI coding agent |
| [MCP Servers](#mcp-servers) | Best MCP servers ranked and categorized |
| [Skills & Workflows](#skills--workflows) | Reusable skills and automation workflows |
| [Tips & Tricks](#tips--tricks) | Power-user techniques from the community |
| [Awesome Projects](#awesome-projects) | Related projects you should know about |

---

## Agent Configs

### Claude Code

<details>
<summary><b>Optimal Settings</b></summary>

```json
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(npx *)"
    ],
    "deny": []
  },
  "env": {
    "CLAUDE_CODE_MAX_THINKING_TOKENS": "10000"
  }
}
```

</details>

<details>
<summary><b>Best MCP Servers for Claude Code</b></summary>

| Server | Description | Install |
|--------|-------------|---------|
| [context7](https://github.com/upstash/context7) | Up-to-date code docs for LLMs | `npx -y @upstash/context7-mcp` |
| [filesystem](https://github.com/modelcontextprotocol/servers) | Safe file system access | `npx -y @modelcontextprotocol/server-filesystem` |
| [github](https://github.com/modelcontextprotocol/servers) | GitHub API integration | `npx -y @modelcontextprotocol/server-github` |
| [sequential-thinking](https://github.com/modelcontextprotocol/servers) | Enhanced reasoning | `npx -y @modelcontextprotocol/server-sequential-thinking` |
| [brave-search](https://github.com/modelcontextprotocol/servers) | Web search | `npx -y @modelcontextprotocol/server-brave-search` |

</details>

<details>
<summary><b>Recommended Skills</b></summary>

- [ECC](https://github.com/affaan-m/ECC) - Agent harness performance optimization (247K stars)
- [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) - Curated skills collection (74K stars)
- [graphify](https://github.com/Graphify-Labs/graphify) - Codebase to knowledge graph (114K stars)

</details>

### OpenAI Codex

<details>
<summary><b>Optimal Settings</b></summary>

```json
// codex.config.json
{
  "model": "o4-mini",
  "approval_mode": "suggest",
  "providers": {
    "openai": {
      "model": "o4-mini",
      "max_tokens": 16384
    }
  }
}
```

</details>

<details>
<summary><b>Best MCP Servers for Codex</b></summary>

| Server | Description | Install |
|--------|-------------|---------|
| [context7](https://github.com/upstash/context7) | Code documentation | `npx -y @upstash/context7-mcp` |
| [memory](https://github.com/modelcontextprotocol/servers) | Persistent memory | `npx -y @modelcontextprotocol/server-memory` |
| [puppeteer](https://github.com/modelcontextprotocol/servers) | Browser automation | `npx -y @modelcontextprotocol/server-puppeteer` |

</details>

### Gemini CLI

<details>
<summary><b>Optimal Settings</b></summary>

```json
// .gemini/settings.json
{
  "selectedAuthType": "oauth-personal",
  "theme": "Default",
  "sandbox": "off",
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Key Features to Enable</b></summary>

- Built-in Google Search grounding
- 1M token context window
- Multimodal capabilities (PDFs, images, sketches)
- Conversation checkpointing

</details>

### OpenCode

<details>
<summary><b>Optimal Settings</b></summary>

```json
// opencode.json
{
  "provider": {
    "name": "anthropic",
    "model": "claude-sonnet-4-20250514"
  },
  "theme": "opencode"
}
```

</details>

### Cursor

<details>
<summary><b>Optimal Settings</b></summary>

```json
// .cursorrules
{
  "rules": [
    "Always use TypeScript",
    "Use functional components",
    "Follow the existing code style",
    "Add JSDoc comments to public functions"
  ]
}
```

</details>

### Windsurf

<details>
<summary><b>Optimal Settings</b></summary>

```json
// .windsurfrules
{
  "rules": [
    "Write clean, maintainable code",
    "Use proper error handling",
    "Follow SOLID principles"
  ]
}
```

</details>

### Cline

<details>
<summary><b>Optimal Settings</b></summary>

```json
// .clinerules
{
  "rules": [
    "Always explain your reasoning",
    "Write tests for new features",
    "Use conventional commits"
  ]
}
```

</details>

---

## MCP Servers

### Top 10 Must-Have MCP Servers

| Rank | Server | Stars | Description |
|------|--------|-------|-------------|
| 1 | [ECC](https://github.com/affaan-m/ECC) | 247K | Agent harness optimization |
| 2 | [n8n](https://github.com/n8n-io/n8n) | 203K | Workflow automation |
| 3 | [context7](https://github.com/upstash/context7) | 61K | Up-to-date code docs |
| 4 | [headroom](https://github.com/headroomlabs-ai/headroom) | 68K | Token compression |
| 5 | [mempalace](https://github.com/MemPalace/mempalace) | 58K | AI memory system |
| 6 | [Scrapling](https://github.com/D4Vinci/Scrapling) | 78K | Web scraping |
| 7 | [Agent-Reach](https://github.com/Panniantong/Agent-Reach) | 77K | Multi-platform search |
| 8 | [graphify](https://github.com/Graphify-Labs/graphify) | 114K | Codebase knowledge graph |
| 9 | [OmniRoute](https://github.com/diegosouzapw/OmniRoute) | 60K | AI gateway (352 providers) |
| 10 | [worldmonitor](https://github.com/koala73/worldmonitor) | 85K | Real-time intelligence |

### By Category

<details>
<summary><b>Knowledge & Memory</b></summary>

- [context7](https://github.com/upstash/context7) - Up-to-date code documentation for LLMs
- [graphify](https://github.com/Graphify-Labs/graphify) - Turn codebase into queryable knowledge graph
- [mempalace](https://github.com/MemPalace/mempalace) - Best-benchmarked AI memory system

</details>

<details>
<summary><b>Productivity</b></summary>

- [ECC](https://github.com/affaan-m/ECC) - Agent harness performance optimization
- [headroom](https://github.com/headroomlabs-ai/headroom) - Compress outputs before they reach LLM
- [OmniRoute](https://github.com/diegosouzapw/OmniRoute) - Free AI gateway, 352 providers

</details>

<details>
<summary><b>Data & Web</b></summary>

- [Scrapling](https://github.com/D4Vinci/Scrapling) - Adaptive web scraping framework
- [Agent-Reach](https://github.com/Panniantong/Agent-Reach) - Read Twitter, Reddit, YouTube, GitHub
- [worldmonitor](https://github.com/koala73/worldmonitor) - Real-time global intelligence dashboard

</details>

<details>
<summary><b>Automation</b></summary>

- [n8n](https://github.com/n8n-io/n8n) - Workflow automation with AI
- [dify](https://github.com/langgenius/dify) - Agentic workflows and RAG pipelines
- [lobehub](https://github.com/lobehub/lobehub) - Chief Agent Operator

</details>

---

## Skills & Workflows

### Must-Have Skills

| Skill | For Agent | Description |
|-------|-----------|-------------|
| [compose-next](#) | Claude Code | Spec-driven development workflow |
| [deep-research](#) | MiMoCode | Multi-source research reports |
| [skill-creator](#) | MiMoCode | Create new agent skills |
| [webwright](#) | Claude Code/Codex | Browser automation agent |
| [learn-everything](#) | MiMoCode | Turn docs into adaptive courses |

### Workflow Templates

<details>
<summary><b>Feature Development</b></summary>

```
1. /compose-next    → Spec generation
2. /plan            → Architecture design
3. /implement       → Code generation
4. /test            → Write tests
5. /review          → Code review
6. /merge           → Ship it
```

</details>

<details>
<summary><b>Bug Investigation</b></summary>

```
1. /diagnose        → Understand the issue
2. /search          → Find related code
3. /fix             → Implement fix
4. /verify          → Test the fix
5. /document        → Update docs
```

</details>

<details>
<summary><b>Research & Analysis</b></summary>

```
1. /research        → Gather information
2. /analyze         → Process findings
3. /summarize       → Create report
4. /present         → Format output
```

</details>

---

## Tips & Tricks

### Power User Techniques

1. **Use GEMINI.md / CLAUDE.md** - Project-specific context files that agents read automatically
2. **Leverage conversation checkpointing** - Save and resume complex sessions
3. **Multi-model routing** - Use different models for different tasks (fast for simple, powerful for complex)
4. **Token compression** - Use headroom to save 20-95% on token costs
5. **Shared memory** - Use mempalace for persistent cross-session knowledge

### Cost Optimization

| Technique | Savings |
|-----------|---------|
| Token compression (headroom) | 20-95% |
| Local models (Ollama) | 100% |
| Smart model routing | 30-50% |
| Context window optimization | 20-40% |

### Security Best Practices

- Never commit API keys
- Use environment variables for secrets
- Review MCP server permissions regularly
- Use sandboxing when available
- Audit agent actions before auto-approval

---

## Awesome Projects

### AI Coding Agents

| Project | Stars | Description |
|---------|-------|-------------|
| [gemini-cli](https://github.com/google-gemini/gemini-cli) | 106K | Google's AI agent in your terminal |
| [codewhale](https://github.com/Hmbown/CodeWhale) | 40K | Open-source coding agent in Rust |
| [claurst](https://github.com/Kuberwastaken/claurst) | 10K | Multi-provider terminal coding agent |
| [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) | 12K | Terminal-native AI coding assistant |
| [goose](https://github.com/aaif-goose/goose) | 53K | Extensible AI agent for any LLM |

### Desktop Apps

| Project | Stars | Description |
|---------|-------|-------------|
| [cc-switch](https://github.com/farion1231/cc-switch) | 131K | All-in-One AI assistant manager |
| [lobehub](https://github.com/lobehub/lobehub) | 82K | Chief Agent Operator |
| [open-webui](https://github.com/open-webui/open-webui) | 151K | User-friendly AI interface |

### Developer Tools

| Project | Stars | Description |
|---------|-------|-------------|
| [Webwright](https://github.com/microsoft/Webwright) | 6K | Browser agent framework by Microsoft |
| [Scrapling](https://github.com/D4Vinci/Scrapling) | 78K | Adaptive web scraping |
| [TrendRadar](https://github.com/sansan0/TrendRadar) | 62K | AI-driven trend monitor |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Ideas

- Add your favorite MCP server config
- Share your agent workflow
- Submit a tips & tricks article
- Translate the README
- Report broken links

---

## License

[MIT](LICENSE)

---

<div align="center">

**If this project helped you, give it a star! It helps others find it.**

[![Star History Chart](https://api.star-history.com/svg?repos=awesome-ai-coding/awesome-ai-coding&type=Date)](https://star-history.com/#awesome-ai-coding/awesome-ai-coding&Date)

</div>
