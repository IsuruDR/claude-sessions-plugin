---
description: Browse and resume past sessions
allowed-tools: [AskUserQuestion]
---

## Data (already loaded — do NOT re-fetch)

**Current working directory:**
!`pwd`

**Current project sessions:**
!`node -e "var h=require('os').homedir(),p=require('path'),fs=require('fs');var ip=JSON.parse(fs.readFileSync(p.join(h,'.claude/plugins/installed_plugins.json'),'utf8'));var pp=ip.plugins['sessions@sessions-plugin'][0].installPath;console.log(JSON.stringify(require(p.join(pp,'scripts','project-sessions.js'))(process.argv[1])))" "$(pwd)"`

## Rendering rules — MANDATORY

- **NEVER** narrate your process, explain what you are about to do, or describe internal steps.
- **NEVER** greet the user, add transitions, or output commentary between views.
- Output **ONLY** the formatted UI views defined below. Nothing else.
- Between navigation steps, output **only** the next view.

## View 1 — Session list

If the current project sessions data above contains entries, sort by `modified` descending. Do NOT render a visual list. Go straight to `AskUserQuestion` with up to 4 options:
- **header**: "Session"

**Generating labels:** For each session, generate a short summary (5-8 words max) that captures what the session is **currently** about. Use `recentPrompts` (the last few user messages) as the primary signal — they reflect the current direction. Fall back to `firstPrompt` only if `recentPrompts` is empty. Examples:
- firstPrompt: "create a sessions plugin", recentPrompts: ["fix the sort order", "title doesn't update"] → "Fix session titles and sorting"
- firstPrompt: "set up auth system", recentPrompts: ["add OAuth support for Google"] → "Add Google OAuth support"
- recentPrompts empty, firstPrompt: "I want to create a claude plugin..." → "Create sessions browser plugin"
- Both empty → "Untitled session"

Do NOT just truncate raw prompts — rephrase as a concise topic label reflecting the session's current focus.

If there are **4 or fewer** total sessions, show all of them as options:
- **label**: The generated summary (5-8 words)
- **description**: `{Mon DD} · {branch} · {sessionId}`

If there are **5 or more** sessions, show the top 3 sessions + 1 "Older sessions" option (4 total):
- Options 1-3: sessions as above
- Option 4: **label**: "Older sessions", **description**: "Showing 1–3 of {total}"

If the user selects "Older sessions", show the next batch of up to 3 sessions. Include these navigation options as needed:
- If more sessions remain, include **"Older sessions"** — "Showing {start}–{end} of {total}"
- Always include **"Back to start"** — "Return to the most recent sessions"

If the user selects "Back to start", re-render View 1 from the beginning.

## View 0 — Empty state

If the current project has zero entries, output only:

*No sessions found for this project.*

Then stop. Do not use `AskUserQuestion`.

## Action prompt

When the user selects a session from View 1, do NOT show session details. Immediately use `AskUserQuestion`:
- **header**: "Action"
- Options:
  - **Resume** — "Continue this session where you left off"
  - **Fork** — "Start a new session branched from this one"
  - **Back** — "Return to session list"

If the user selects "Back", re-render View 1 from the beginning. No narration.

## Command output

**Session ID validation:** Before rendering the command, verify that the `sessionId` matches a UUID format (hexadecimal characters and hyphens only, e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). If it does not match, display an error: "Invalid session ID format." and return to View 1. Do NOT render a command with an invalid session ID.

When the user selects Resume or Fork, output **only** the appropriate command:

For **Resume**:

> Run: `/resume {sessionId}`

For **Fork**:

> Run: `/fork {sessionId}`
