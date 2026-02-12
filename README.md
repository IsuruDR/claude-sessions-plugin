# Sessions Plugin for Claude Code

Browse and resume your past Claude Code sessions. Quickly pick a previous conversation and resume where you left off, or fork it into a new session.

## Features

- **Browse sessions** — See your recent sessions with AI-generated summaries
- **Resume** — Continue any past session exactly where you left off
- **Fork** — Branch off from a previous session into a new one
- **Clipboard** — Commands are automatically copied to your clipboard

## Installation

```bash
/install-plugin https://github.com/isurudr/sessions-plugin
```

## Usage

Run the slash command inside Claude Code:

```
/sessions
```

Pick a session, choose Resume or Fork, and paste the command in a new terminal.

## Plugin Structure

```
sessions-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata
│   └── marketplace.json     # Marketplace configuration
├── commands/
│   └── sessions.md          # Sessions slash command
├── scripts/
│   └── project-sessions.js  # Session data loader
└── README.md
```

## Author

Isuru Ranaweera
