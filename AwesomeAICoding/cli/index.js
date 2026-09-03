#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

const agents = {
  claude: {
    name: 'Claude Code',
    configDir: '.claude',
    configFile: 'settings.json',
    defaultConfig: {
      permissions: {
        allow: ['Read', 'Write', 'Bash(git *)', 'Bash(npm *)', 'Bash(npx *)'],
        deny: []
      },
      env: {
        CLAUDE_CODE_MAX_THINKING_TOKENS: '10000'
      }
    },
    mcpServers: {
      context7: {
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp']
      },
      'sequential-thinking': {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
      }
    }
  },
  codex: {
    name: 'OpenAI Codex',
    configDir: '.codex',
    configFile: 'config.json',
    defaultConfig: {
      model: 'o4-mini',
      approval_mode: 'suggest'
    }
  },
  gemini: {
    name: 'Gemini CLI',
    configDir: '.gemini',
    configFile: 'settings.json',
    defaultConfig: {
      selectedAuthType: 'oauth-personal',
      theme: 'Default',
      sandbox: 'off'
    },
    mcpServers: {
      context7: {
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp']
      }
    }
  },
  opencode: {
    name: 'OpenCode',
    configFile: 'opencode.json',
    defaultConfig: {
      provider: {
        name: 'anthropic',
        model: 'claude-sonnet-4-20250514'
      },
      theme: 'opencode'
    }
  },
  cursor: {
    name: 'Cursor',
    configFile: '.cursorrules',
    defaultConfig: {
      rules: [
        'Always use TypeScript',
        'Use functional components',
        'Follow the existing code style'
      ]
    }
  }
};

function printBanner() {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║           Awesome AI Coding - Setup Tool             ║
  ║    Configure all your AI coding agents in one go     ║
  ╚══════════════════════════════════════════════════════╝
  `);
}

function detectInstalledAgents() {
  const installed = [];
  for (const [key, agent] of Object.entries(agents)) {
    if (agent.configDir) {
      if (fs.existsSync(path.join(process.cwd(), agent.configDir))) {
        installed.push(key);
      }
    } else if (fs.existsSync(path.join(process.cwd(), agent.configFile))) {
      installed.push(key);
    }
  }
  return installed;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeConfig(agent, config) {
  const cwd = process.cwd();
  
  if (agent.configDir) {
    ensureDir(path.join(cwd, agent.configDir));
  }
  
  const configPath = path.join(cwd, agent.configDir || '.', agent.configFile);
  const existingConfig = fs.existsSync(configPath) 
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {};
  
  const merged = { ...existingConfig, ...config };
  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
  return configPath;
}

function setupMcpServers(agent, agentKey) {
  if (!agent.mcpServers) return null;
  
  const cwd = process.cwd();
  let configPath;
  
  if (agentKey === 'claude') {
    configPath = path.join(cwd, '.claude', 'settings.json');
    ensureDir(path.join(cwd, '.claude'));
  } else if (agentKey === 'gemini') {
    configPath = path.join(cwd, '.gemini', 'settings.json');
    ensureDir(path.join(cwd, '.gemini'));
  } else {
    return null;
  }
  
  const existing = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {};
  
  existing.mcpServers = { ...existing.mcpServers, ...agent.mcpServers };
  fs.writeFileSync(configPath, JSON.stringify(existing, null, 2));
  return configPath;
}

async function setupAgent(agentKey) {
  const agent = agents[agentKey];
  console.log(`\n  Setting up ${agent.name}...`);
  
  const configPath = writeConfig(agent, agent.defaultConfig);
  console.log(`  ✓ Config written to ${configPath}`);
  
  const mcpPath = setupMcpServers(agent, agentKey);
  if (mcpPath) {
    console.log(`  ✓ MCP servers configured in ${mcpPath}`);
  }
  
  console.log(`  ✓ ${agent.name} is ready!\n`);
}

async function main() {
  printBanner();
  
  const installed = detectInstalledAgents();
  
  if (installed.length > 0) {
    console.log(`  Detected installed agents: ${installed.map(k => agents[k].name).join(', ')}\n`);
  }
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'setup') {
    const agentArg = args.find(a => a.startsWith('--agent='));
    const specificAgent = agentArg ? agentArg.split('=')[1] : null;
    
    if (specificAgent) {
      if (!agents[specificAgent]) {
        console.error(`  Unknown agent: ${specificAgent}`);
        console.error(`  Available agents: ${Object.keys(agents).join(', ')}`);
        process.exit(1);
      }
      await setupAgent(specificAgent);
    } else {
      console.log('  Which agents would you like to set up?\n');
      const choices = Object.entries(agents).map(([key, agent]) => ({
        key,
        name: agent.name,
        installed: installed.includes(key)
      }));
      
      choices.forEach((c, i) => {
        const status = c.installed ? ' (detected)' : '';
        console.log(`    ${i + 1}. ${c.name}${status}`);
      });
      console.log(`    a. All agents\n`);
      
      const answer = await question('  Enter numbers separated by commas (or "a" for all): ');
      
      if (answer.toLowerCase() === 'a') {
        for (const key of Object.keys(agents)) {
          await setupAgent(key);
        }
      } else {
        const indices = answer.split(',').map(n => parseInt(n.trim()) - 1);
        for (const i of indices) {
          if (choices[i]) {
            await setupAgent(choices[i].key);
          }
        }
      }
    }
  } else if (args[0] === 'list') {
    console.log('  Available agents:\n');
    for (const [key, agent] of Object.entries(agents)) {
      const status = installed.includes(key) ? ' ✓ installed' : '';
      console.log(`    ${key}: ${agent.name}${status}`);
    }
    console.log('');
  } else {
    console.log('  Usage:\n');
    console.log('    npx awesome-ai-coding setup              Interactive setup');
    console.log('    npx awesome-ai-coding setup --agent=claude Setup specific agent');
    console.log('    npx awesome-ai-coding list               List available agents\n');
  }
  
  rl.close();
}

main().catch(console.error);
