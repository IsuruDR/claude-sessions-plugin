# Sessions Plugin for Claude Code

You want to resume a session, but when you use `/resume` all you see is some vague initial detail that you initiated the session with. You are often lost trying to correlate plan details with where you were to resume (or fork) the new piece of work.
Browsing session history with the meaningful context helps here, and that is what this plugin exactly does. It scans your session history, generates concise labels from your most recent messages, and lets you browse, resume, or fork sessions with the context you need to jump right back in.

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
