# Sessions Plugin for Claude Code

Browse, search, and manage your past Claude Code sessions across all projects. Quickly view session details, get commands to resume a previous conversation where you left off, or fork it into a new session.

## Features

- **Cross-project browsing** — View sessions from all your projects in one place
- **Session details** — See branch, message count, timestamps, and the first prompt at a glance
- **Resume** — Continue any past session exactly where you left off
- **Fork** — Branch off from a previous session into a new one

## Installation

```bash
/plugin install https://github.com/isurudr/claude-sessions-plugin
```

## Usage

Run the slash command inside Claude Code:

```
/sessions
```

This opens an interactive explorer where you can navigate sessions, view details, and choose to resume or fork.

## Plugin Structure

```
sessions-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata
│   └── marketplace.json     # Marketplace configuration
├── commands/
│   └── sessions.md          # Sessions slash command
└── README.md
```

## Author

Isuru Ranaweera
