---
description: Browse past sessions, view details, and resume or fork any session
allowed-tools: [Read, AskUserQuestion]
---

## Data (already loaded — do NOT re-fetch)

**Current working directory:**
!`pwd`

**Current project sessions:**
!`P=$(pwd) && E=$(echo "$P" | sed 's|/|-|g') && cat "$HOME/.claude/projects/$E/sessions-index.json" 2>/dev/null || echo '{"entries":[]}'`

**All projects with sessions:**
!`node -e "const fs=require('fs'),p=require('path'),d=p.join(require('os').homedir(),'.claude/projects');try{fs.readdirSync(d).forEach(dir=>{try{const f=JSON.parse(fs.readFileSync(p.join(d,dir,'sessions-index.json')));if(f.entries&&f.entries.length){const s=f.entries.sort((a,b)=>b.modified.localeCompare(a.modified))[0];console.log(JSON.stringify({path:f.originalPath,encodedPath:dir,count:f.entries.length,latest:s.modified,summary:s.summary}))}}catch(e){}})}catch(e){}"`

## Rendering rules — MANDATORY

- **NEVER** narrate your process, explain what you are about to do, or describe internal steps.
- **NEVER** greet the user, add transitions, or output commentary between views.
- Output **ONLY** the formatted UI views defined below. Nothing else.
- Between navigation steps (Back, project switch), output **only** the next view.
- When loading cross-project sessions via `Read`, do NOT mention the file path or that you are reading a file. Just render the view.

## View 1 — Explorer (current project has sessions)

If the current project sessions data above contains entries, sort by `modified` descending and render:

**Sessions Explorer**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 1. **{summary}**
    `{Mon DD}` · `{branch}` · {N} msgs · `{sessionId[:8]}`

 2. ...

*{total} sessions · Showing latest 5*

Then immediately use `AskUserQuestion` with up to 4 options total:
- **header**: "Session"

If there are **5 or fewer** total sessions, show all of them (up to 4 in options, the rest accessible via "Other"):
- **label**: The session summary text (truncated to ~60 chars if needed)
- **description**: `{Mon DD} · {branch} · {N} msgs`

**Formatting rules for View 1:**
- Session summaries must be wrapped in `**bold**`
- Dates, branch names, and session ID prefixes must be wrapped in backtick `` ` `` inline code
- The title "Sessions Explorer" must be `**bold**`
- The footer line must be wrapped in `*italics*`

If there are **more than 5** sessions, show the top 3 sessions + 1 "Older sessions" option (4 total):
- Options 1-3: sessions as above
- Option 4: **label**: "Older sessions", **description**: "Show the next batch"

If the user selects "Older sessions", show the next 5 in the explorer view and repeat. When no more sessions remain, omit the "Older sessions" option.

## View 0 — Empty state (no sessions anywhere)

If the current project has zero entries AND the "All projects" data above is empty (no output lines), render:

**Sessions Explorer**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*No sessions found in any project.*

Then stop. Do not use `AskUserQuestion`.

## View 2 — Cross-project browser (current project has NO sessions)

If the current project has zero entries but other projects have sessions, render using the "All projects" data above.

**Current project highlighting:** Compare the current working directory (from Data section) against each project's `path`. If a project's path matches the current working directory, mark it with `▸` and append `← current` to its line. This project should appear first in the list regardless of sort order.

**Sessions Explorer** — All Projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ▸ 1. **{path}** ← *current*
      `{count} sessions` · latest: `{Mon DD}` · {summary}

   2. **{path}**
      `{count} sessions` · latest: `{Mon DD}` · {summary}

   ...

Then use `AskUserQuestion` with up to 4 projects as options:
- **label**: The last path segment (project folder name) — append `(current)` if it matches the current working directory
- **description**: `{count} sessions · latest: {Mon DD}`
- **header**: "Project"

When the user selects a project, use `Read` to load `~/.claude/projects/{encodedPath}/sessions-index.json`, then render **View 1** for that project's entries.

## View 3 — Detail + action (single screen)

When the user selects a session from View 1, render the detail view and action prompt as **one step**. Remember whether the user arrived here from View 1 (current project) or View 2 (cross-project) — this determines where "Back" returns to.

**{summary}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session   `{full sessionId}`
Branch    `{branch}`
Created   `{Mon DD, YYYY h:mm AM/PM}`
Modified  `{Mon DD, YYYY h:mm AM/PM}`
Messages  **{N}**

> *{firstPrompt, truncated to 200 chars}*

Immediately follow with `AskUserQuestion`:
- **header**: "Action"
- Options:
  - **Resume** — "Continue this session where you left off"
  - **Fork** — "Start a new session branched from this one"
  - **Back** — "Return to the session list"

## View 4 — Command output

When the user selects Resume or Fork, output **only**:

For **Resume**:
```
claude --resume {sessionId}
```
> Run in a new terminal window.

For **Fork**:
```
claude --resume {sessionId} --fork-session
```
> Run in a new terminal window.

## Back navigation

When the user selects "Back":
- If the user arrived at View 3 from **View 1** (current project sessions), silently re-render View 1.
- If the user arrived at View 3 from **View 2** (cross-project browser), silently re-render View 1 for that cross-project (not View 2).
No narration.
