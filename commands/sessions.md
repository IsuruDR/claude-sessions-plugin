---
description: Browse and resume past sessions
allowed-tools: [Bash, AskUserQuestion]
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

If there are **5 or fewer** total sessions, show all of them (up to 4 in options, the rest accessible via "Other"):
- **label**: The session summary text (truncated to ~60 chars if needed)
- **description**: `{Mon DD} · {branch} · {N} msgs`

If there are **more than 5** sessions, show the top 3 sessions + 1 "Older sessions" option (4 total):
- Options 1-3: sessions as above
- Option 4: **label**: "Older sessions", **description**: "Show the next batch"

If the user selects "Older sessions", show the next batch of 3 sessions (+ "Older sessions" if more remain). When no more sessions remain, omit the "Older sessions" option.

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

## Command output

**Session ID validation:** Before rendering the command, verify that the `sessionId` matches a UUID format (hexadecimal characters and hyphens only, e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). If it does not match, display an error: "Invalid session ID format." and return to View 1. Do NOT render a shell command with an invalid session ID.

When the user selects Resume or Fork:

1. Copy the command to clipboard silently using `Bash`: `echo -n "claude --resume '{sessionId}'" | pbcopy` (or with `--fork-session` for Fork). Do NOT show any output from this step.
2. Then output **only**:

For **Resume**:
```
claude --resume '{sessionId}'
```
> Copied to clipboard. Run in a new terminal.

For **Fork**:
```
claude --resume '{sessionId}' --fork-session
```
> Copied to clipboard. Run in a new terminal.
