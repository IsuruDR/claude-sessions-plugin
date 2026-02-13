const fs = require('fs'), p = require('path'), os = require('os');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(s) {
  return typeof s === 'string' && UUID_RE.test(s);
}

function parseSessionFile(filePath, fileId) {
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
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
      return {
        sessionId: fileId,
        firstPrompt: firstPrompt ? firstPrompt.slice(0, 200) : '',
        summary: firstPrompt ? firstPrompt.replace(/\n/g, ' ').slice(0, 80) : 'Untitled session',
        messageCount: mc,
        created: created || '',
        modified: modified || '',
        gitBranch: br || 'main',
        isSidechain: sc
      };
    }
  } catch (fe) { /* skip unreadable files */ }
  return null;
}

function scanForMissingSessions(dir, indexedIds) {
  try {
    const files = fs.readdirSync(dir).filter(function (f) {
      if (!f.endsWith('.jsonl')) return false;
      var id = f.replace('.jsonl', '');
      return isValidUUID(id) && !indexedIds.has(id);
    });

    const entries = [];
    for (const file of files) {
      const fileId = file.replace('.jsonl', '');
      const entry = parseSessionFile(p.join(dir, file), fileId);
      if (entry) entries.push(entry);
    }
    return entries;
  } catch (e) {
    return [];
  }
}

function getProjectSessions(cwd) {
  const enc = cwd.split('/').join('-');
  const dir = p.join(os.homedir(), '.claude/projects', enc);
  const fp = p.join(dir, 'sessions-index.json');

  // Try reading existing index first
  try {
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (d.entries) {
      d.entries = d.entries
        .filter(function (e) { return isValidUUID(e.sessionId); })
        .map(function (e) {
          var r = Object.assign({}, e);
          delete r.fullPath;
          if (r.firstPrompt) r.firstPrompt = r.firstPrompt.slice(0, 200);
          return r;
        });

      // Scan for sessions on disk that are missing from the index
      var indexedIds = new Set(d.entries.map(function (e) { return e.sessionId; }));
      var missing = scanForMissingSessions(dir, indexedIds);
      if (missing.length > 0) {
        d.entries = d.entries.concat(missing);
      }
    }
    d.entries.sort(function (a, b) { return (b.modified || '').localeCompare(a.modified || ''); });
    return d;
  } catch (e) {
    // no index file — fall through to scan
  }

  // Fallback: scan all .jsonl files
  var missing = scanForMissingSessions(dir, new Set());
  missing.sort(function (a, b) { return (b.modified || '').localeCompare(a.modified || ''); });
  return { entries: missing };
}

// CLI mode
if (require.main === module) {
  const cwd = process.argv[2] || process.cwd();
  console.log(JSON.stringify(getProjectSessions(cwd)));
} else {
  module.exports = getProjectSessions;
}
