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

**Generating labels:** For each session, generate a short summary (5-8 words max) from its `firstPrompt` that captures the intent/topic. Examples:
- "I want to create a claude plugin to see the available sessions..." → "Create sessions browser plugin"
- "Can you add some subtle colors to make it..." → "Add colors to UI"
- "Implement the following plan: # Plan: Rewrite Sessions Plugin..." → "Rewrite sessions plugin UX"
- If `firstPrompt` is empty, use "Untitled session"

Do NOT just truncate the raw prompt — rephrase it as a concise topic label.

If there are **4 or fewer** total sessions, show all of them as options:
- **label**: The generated summary (5-8 words)
- **description**: `{Mon DD} · {branch} · {N} msgs`

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

**Session ID validation:** Before rendering the command, verify that the `sessionId` matches a UUID format (hexadecimal characters and hyphens only, e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). If it does not match, display an error: "Invalid session ID format." and return to View 1. Do NOT render a shell command with an invalid session ID.

When the user selects Resume or Fork:

1. Copy the command to clipboard using `Bash`. Detect the platform and use the appropriate command:
   - macOS: `printf '%s' "{command}" | pbcopy`
   - Linux: `printf '%s' "{command}" | xclip -selection clipboard 2>/dev/null || printf '%s' "{command}" | xsel --clipboard 2>/dev/null`
   - Check the exit code to determine if the copy succeeded.
   Do NOT show any output from this step.
2. Then output **only** the command block and the appropriate message:

For **Resume**:
```
claude --resume '{sessionId}'
```

For **Fork**:
```
claude --resume '{sessionId}' --fork-session
```

If clipboard copy succeeded:
> Copied to clipboard. Run in a new terminal.

If clipboard copy failed:
> Copy the command above and run in a new terminal.
