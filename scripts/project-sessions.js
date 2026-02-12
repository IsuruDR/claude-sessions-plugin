const fs = require('fs'), p = require('path'), os = require('os');

function getProjectSessions(cwd) {
  const enc = cwd.split('/').join('-');
  const dir = p.join(os.homedir(), '.claude/projects', enc);
  const fp = p.join(dir, 'sessions-index.json');

  // Try reading existing index first
  try {
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (d.entries) {
      d.entries = d.entries.map(function (e) {
        var r = Object.assign({}, e);
        delete r.fullPath;
        if (r.firstPrompt) r.firstPrompt = r.firstPrompt.slice(0, 200);
        return r;
      });
    }
    return d;
  } catch (e) {
    // no index file — fall through to scan
  }

  // Fallback: scan .jsonl files
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));
    const entries = [];

    for (const file of files) {
      try {
        const lines = fs.readFileSync(p.join(dir, file), 'utf8').split('\n');
        const fileId = file.replace('.jsonl', '');
        let br, firstPrompt, created, modified, sc = false, mc = 0;

        for (const l of lines) {
          if (!l) continue;
          try {
            const o = JSON.parse(l);
            if (!br && o.gitBranch && o.gitBranch !== 'HEAD') br = o.gitBranch;
            if (o.isSidechain) sc = true;
            if (o.timestamp) {
              if (!created || o.timestamp < created) created = o.timestamp;
              if (!modified || o.timestamp > modified) modified = o.timestamp;
            }
            if (o.type === 'user' && !o.isMeta && o.message) {
              mc++;
              if (!firstPrompt) {
                const c = o.message.content;
                if (typeof c === 'string' && !c.startsWith('<command') && !c.startsWith('[Request interrupted')) {
                  firstPrompt = c;
                } else if (Array.isArray(c)) {
                  const t = c.find(x => x.type === 'text' && x.text && !x.text.startsWith('<command') && !x.text.startsWith('[Request interrupted'));
                  if (t) firstPrompt = t.text;
                }
              }
            }
            if (o.type === 'assistant') mc++;
          } catch (pe) { /* skip malformed lines */ }
        }

        if (mc > 0) {
          entries.push({
            sessionId: fileId,
            firstPrompt: firstPrompt ? firstPrompt.slice(0, 200) : '',
            summary: firstPrompt ? firstPrompt.replace(/\n/g, ' ').slice(0, 80) : 'Untitled session',
            messageCount: mc,
            created: created || '',
            modified: modified || '',
            gitBranch: br || 'main',
            isSidechain: sc
          });
        }
      } catch (fe) { /* skip unreadable files */ }
    }

    return { entries };
  } catch (de) {
    return { entries: [] };
  }
}

// CLI mode
if (require.main === module) {
  const cwd = process.argv[2] || process.cwd();
  console.log(JSON.stringify(getProjectSessions(cwd)));
} else {
  module.exports = getProjectSessions;
}
