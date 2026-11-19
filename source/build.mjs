// Build: content/*.md + src/* -> dist/index.html (single self-contained file)
const { marked } = await import(process.env.MARKED_PATH || 'marked');
import fs from 'fs';
import path from 'path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.resolve(ROOT, process.env.OUT_DIR || 'dist');
const errors = [];

function parseQuestions(lines, type, unitId) {
  const out = [];
  let q = null, inFence = false, code = [];
  const push = () => { if (q) out.push(q); q = null; };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (inFence) {
      if (/^```/.test(line)) { inFence = false; const opt = q.opts && q.opts[q.opts.length - 1]; if (q._optFence && opt) { opt.code = code.join('\n'); opt.lang = q._lang; q._optFence = false; } else q.code = code.join('\n'); code = []; }
      else code.push(raw);
      continue;
    }
    let m;
    if ((m = line.match(/^Q:\s*(.*)$/))) { push(); q = { q: m[1], choices: [], a: -1 }; continue; }
    if (!q) continue;
    if ((m = line.match(/^```(\w*)/))) { inFence = true; if (q._optFence) q._lang = m[1] || 'text'; else q.lang = m[1] || 'text'; continue; }
    if ((m = line.match(/^PTS:\s*(\d+)/))) { q.pts = +m[1]; q.sheet = true; continue; }
    if ((m = line.match(/^ASK:\s*(.*)$/))) { q.ask = m[1]; q.sheet = true; continue; }
    if ((m = line.match(/^OPT\s+([IVX]+)[.:]\s*(.*)$/))) { (q.opts = q.opts || []).push({ n: m[1], text: m[2] }); q._optFence = !m[2]; q.sheet = true; continue; }
    if (line === 'TABLE:') { q.table = []; q.sheet = true; continue; }
    if (q.table && !q.choices.length && /^\|.*\|$/.test(line)) { if (!/^\|[\s:|-]+\|$/.test(line)) q.table.push(line.slice(1, -1).split('|').map(c => c.trim())); continue; }
    if ((m = line.match(/^- \[( |x)\] (.*)$/))) { if (m[1] === 'x') q.a = q.choices.length; q.choices.push(m[2]); continue; }
    if ((m = line.match(/^WHY:\s*(.*)$/))) { q.why = m[1]; continue; }
    if ((m = line.match(/^LINE:\s*(.*)$/))) { q.lines = m[1].split(',').map(s => parseInt(s.trim(), 10)); continue; }
    if ((m = line.match(/^FIX:\s*(.*)$/))) { q.fix = m[1]; continue; }
    if (line.trim() && !q.code && !q.choices.length && !q.why && !q.sheet) q.q += ' ' + line.trim();
  }
  push();
  out.forEach((x, i) => {
    x.id = `${unitId}-${type[0]}${i + 1}`;
    x.kind = type === 'bug' ? 'bug' : type === 'fill' ? 'fill' : 'mcq';
    delete x._optFence; delete x._lang;
    if (x.sheet) { x.pts = x.pts || 1; if (x.opts && x.opts.some(o => !o.text && !o.code)) errors.push(`${x.id}: empty OPT`); }
    if (type === 'fill') { delete x.choices; delete x.a; if (!x.why) errors.push(`${x.id}: missing WHY`); return; }
    x.type = type;
    if (type === 'bug') {
      const n = (x.code || '').split('\n').length;
      if (!x.lines || x.lines.some(l => !(l >= 1 && l <= n))) errors.push(`${x.id}: bad LINE`);
      if (!x.fix || !x.why) errors.push(`${x.id}: missing FIX/WHY`);
      delete x.choices; delete x.a;
    } else {
      if (x.choices.length < 2) errors.push(`${x.id}: <2 choices`);
      if (x.a < 0) errors.push(`${x.id}: no correct answer`);
      if (x.choices.filter((_, i) => i === x.a).length !== 1) errors.push(`${x.id}: correct issue`);
      if (!x.why) errors.push(`${x.id}: missing WHY`);
    }
  });
  return out;
}

// ```python run / ```python visual -> runnable examples (class language-python-run / -visual)
const prepMd = md => md.replace(/^```(\w+) (run|visual)\s*$/gm, '```$1-$2');
function fence(lines) { const out = []; let on = false, lang = ''; for (const l of lines) { const m = l.match(/^```(\w*)/); if (m) { if (!on) { on = true; lang = m[1]; continue; } else { on = false; continue; } } if (on) out.push(l); } return { code: out.join('\n'), lang }; }
function parseExercise(lines, unitId, idx, title, lang, mins) {
  const parts = { prompt: [] }; let cur = 'prompt', hint = ''; const hints = [];
  for (const l of lines) {
    const m = l.match(/^(STARTER|TESTS|SOLUTION)\s*$/); if (m) { cur = m[1].toLowerCase(); parts[cur] = []; continue; }
    const h = l.match(/^HINT:\s*(.*)$/); if (h) { hints.push(h[1]); hint = hint || h[1]; continue; }
    parts[cur].push(l);
  }
  const id = `${unitId}-e${idx}`;
  const starter = fence(parts.starter || []).code, sol = fence(parts.solution || []).code;
  const tests = fence(parts.tests || []).code.split('\n').map(t => t.trim()).filter(t => t && !t.startsWith('#') && !t.startsWith('//'));
  if (!tests.length) errors.push(id + ': no tests'); if (!sol) errors.push(id + ': no solution');
  const visual = /(import|from)\s+(turtle|pixel)\b/.test(starter + '\n' + sol);
  return { id, title, lang, mins: +mins || 10, prompt: marked.parse(prepMd(parts.prompt.join('\n').trim())), starter, tests, solution: sol, hint, hints, visual, unit: unitId };
}
const UNITS_ALL = {};
function parseCourse(text, file) {
  const lines = text.split('\n');
  let course = null, unit = null, section = null, buf = [];
  const flush = () => {
    if (!section || !unit) { buf = []; return; }
    if (section.type === 'exercise') { unit.ex.push(parseExercise(buf, unit.id, unit.ex.length + 1, section.title, section.lang, section.mins)); buf = []; section = null; return; }
    if (section.type === 'fill') {
      const qs = parseQuestions(buf, 'fill', unit.id);
      qs.forEach((q, i) => { q.id = `${unit.id}-f${unit.fill.length + 1}`; q.title = section.title; const blanks = []; q.code = q.code.replace(/\[\[(.+?)\]\]/g, (_, a) => { blanks.push(a.split('|').map(x => x.trim())); return '\u0000' + (blanks.length - 1) + '\u0000'; }); q.blanks = blanks; if (!blanks.length) errors.push(q.id + ': no blanks'); unit.fill.push(q); });
      buf = []; section = null; return;
    }
    if (section.type === 'lesson') {
      const li = unit.lessons.length, quizzes = [];
      let md = buf.join('\n').trim().replace(/^:::quiz\s*\n([\s\S]*?)\n:::\s*$/gm, (_, body) => {
        const qs = parseQuestions(body.split('\n'), 'quiz', unit.id);
        qs.forEach(q => { q.id = `${unit.id}-L${li + 1}q${quizzes.length + 1}`; q.inline = true; quizzes.push(q); });
        return `\n<div class="lq" data-lq="${quizzes.length - 1}"></div>\n`;
      });
      const text = md.replace(/<div class="lq"[^>]*><\/div>/g, '').replace(/[`*#>|_-]/g, ' ').replace(/\s+/g, ' ');
      const topic = (section.title.match(/^(\d+\.\d+)\s/) || [])[1] || '';
      unit.lessons.push({ title: section.title, mins: section.mins, skills: section.skills || [], topic, html: marked.parse(prepMd(md)), text, quizzes });
    } else {
      { unit._sec = unit._sec || {}; const n = unit._sec[section.type] = (unit._sec[section.type] || 0) + 1; unit[section.type].push(...parseQuestions(buf, section.type, unit.id + (n === 1 ? '' : n === 2 ? 'x' : 'x' + n))); }
    }
    buf = []; section = null;
  };
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    let m;
    if (!inFence && (m = line.match(/^# COURSE (.*)$/))) {
      const [id, title, short, emoji, yearN, yearLabel, color] = m[1].split('|').map(s => s.trim());
      course = { id, title, short, emoji, year: +yearN, yearLabel, color, blurb: '', units: [] };
      continue;
    }
    if (!inFence && course && !course.blurb && !course.units.length && (m = line.match(/^> (.*)$/))) { course.blurb = m[1]; continue; }
    if (!inFence && (m = line.match(/^## UNIT (.*)$/))) {
      flush();
      const [id, title, weight] = m[1].split('|').map(s => s.trim());
      if (!course || UNITS_ALL[id]) { unit = UNITS_ALL[id]; if (!unit) errors.push('unknown unit ' + id); continue; }
      unit = { id, title, weight: weight || '', lessons: [], ex: [], fill: [], quiz: [], trace: [], bug: [] };
      UNITS_ALL[id] = unit; course.units.push(unit);
      continue;
    }
    if (!inFence && (m = line.match(/^### (LESSON|QUIZ|TRACE|BUG|EXERCISE|FILL)\b\s*(.*)$/))) {
      flush();
      const type = m[1].toLowerCase();
      section = { type };
      if (type === 'lesson') { const [t, mins, skills] = m[2].split('|').map(s => s.trim()); section.title = t; section.mins = +mins || 10; section.skills = (skills || '').split(',').map(x => x.trim()).filter(Boolean); }
      if (type === 'exercise') { const [t, lang, mins] = m[2].split('|').map(s => s.trim()); Object.assign(section, { title: t, lang, mins }); }
      if (type === 'fill') section.title = m[2].trim();
      continue;
    }
    buf.push(line);
  }
  flush();
  return course;
}

const files = fs.readdirSync(path.join(ROOT, 'content')).filter(f => f.endsWith('.md') && !/glossary|frq/i.test(f)).sort();
// ---- FRQs (AP CSA free response practice) ----
const FRQS = [];
function parseFrqs(text) {
  let cur = null, part = null, mode = '', buf = [];
  const flushScenario = () => { if (cur && mode === 'scenario') { cur.scenario = marked.parse(buf.join('\n').trim()); buf = []; } };
  const flushPart = () => { if (part) { part.prompt = marked.parse(part.promptLines.join('\n').trim()); part.starter = fence(part.starterLines).code; part.solution = fence(part.solutionLines).code; delete part.promptLines; delete part.starterLines; delete part.solutionLines; const sum = part.rubric.reduce((n, r) => n + r.pts, 0); if (sum !== part.points) errors.push(`${cur.id} part ${part.label}: rubric ${sum} != ${part.points}`); cur.parts.push(part); part = null; } };
  for (const line of text.split('\n')) {
    let m;
    if ((m = line.match(/^## FRQ (.*)$/))) { flushScenario(); flushPart(); if (cur) FRQS.push(cur); const [id, q, type, title] = m[1].split('|').map(s => s.trim()); cur = { id, q: +q, type, title, scenario: '', parts: [] }; mode = ''; continue; }
    if (!cur) continue;
    if (/^SCENARIO\s*$/.test(line)) { mode = 'scenario'; buf = []; continue; }
    if ((m = line.match(/^### PART (\w+)\s*\|\s*(\d+)/))) { flushScenario(); flushPart(); part = { label: m[1], points: +m[2], promptLines: [], starterLines: [], solutionLines: [], rubric: [] }; mode = 'prompt'; continue; }
    if (part && /^(STARTER|SOLUTION|RUBRIC)\s*$/.test(line)) { mode = line.trim().toLowerCase(); continue; }
    if (mode === 'scenario') buf.push(line);
    else if (part && mode === 'prompt') part.promptLines.push(line);
    else if (part && mode === 'starter') part.starterLines.push(line);
    else if (part && mode === 'solution') part.solutionLines.push(line);
    else if (part && mode === 'rubric' && (m = line.match(/^- (\d+)\s*\|\s*(.+)$/))) part.rubric.push({ pts: +m[1], text: m[2].trim() });
  }
  flushScenario(); flushPart(); if (cur) FRQS.push(cur);
}
for (const f of fs.readdirSync(path.join(ROOT, 'content')).filter(f => /frq/i.test(f)).sort()) parseFrqs(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));
const GLOSSARY = [];
for (const f of fs.readdirSync(path.join(ROOT, 'content')).filter(f => /glossary/i.test(f))) {
  for (const line of fs.readFileSync(path.join(ROOT, 'content', f), 'utf8').split('\n')) {
    const m = line.match(/^- \*\*(.+?)\*\*(?:\s*\(([^)]*)\))?\s*:\s*(.+)$/);
    if (m) GLOSSARY.push({ term: m[1].trim(), aliases: (m[2] || '').split(',').map(s => s.trim()).filter(Boolean), def: m[3].trim() });
  }
}
const courses = files.map(f => parseCourse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'), f)).filter(Boolean);
// Roblox Game Coding (Luau) course, kept as prebuilt JSON; goes right after Web Development
const LUAU_JSON = path.join(ROOT, 'content', 'luau-course.json');
if (fs.existsSync(LUAU_JSON)) { const lc = JSON.parse(fs.readFileSync(LUAU_JSON, 'utf8')); const wi = courses.findIndex(c => c.id === 'web'); courses.splice(wi + 1, 0, lc); }
const LUAU_GLOSS = path.join(ROOT, 'content', 'luau-glossary.json');
if (fs.existsSync(LUAU_GLOSS)) GLOSSARY.push(...JSON.parse(fs.readFileSync(LUAU_GLOSS, 'utf8')));

// stats
let nL = 0, nQ = 0, nT = 0, nB = 0, nU = 0, nE = 0, nF = 0;
for (const c of courses) for (const u of c.units) { nU++; nL += u.lessons.length; nQ += u.quiz.length; nT += u.trace.length; nB += u.bug.length; nE += u.ex.length; nF += u.fill.length; }
console.log(`courses ${courses.length}, units ${nU}, lessons ${nL}, quiz ${nQ}, trace ${nT}, bug ${nB}, exercises ${nE}, fill ${nF}`);
courses.forEach(c => c.units.forEach(u => delete u._sec));
if (process.env.DUMP_EX) fs.writeFileSync(process.env.DUMP_EX, JSON.stringify(courses.flatMap(c => c.units.flatMap(u => u.ex))));
if (errors.length) { console.error('CONTENT ERRORS:\n' + errors.join('\n')); process.exit(1); }

const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const jsOrder = ['luau-engine.js', 'core.js', 'ui.js', 'glossary.js', 'runner.js', 'engine.js', 'views-learn.js', 'views-study.js', 'views-assign.js', 'views-exam.js', 'views-feedback.js', 'views-arcade.js', 'squad.js', 'views-squad.js', 'views-me.js', 'main.js'];
const js = jsOrder.map(f => `// ---- ${f} ----\n` + read(f)).join('\n');
const contentJs = 'window.COURSES = ' + JSON.stringify(courses).replace(/<\/(script)/gi, '<\\/$1') + ';\nwindow.GLOSSARY = ' + JSON.stringify(GLOSSARY) + ';\nwindow.FRQS = ' + JSON.stringify(FRQS).replace(/<\/(script)/gi, '<\\/$1') + ';';
console.log('glossary terms', GLOSSARY.length, '· frqs', FRQS.length, FRQS.map(f => f.id + ':' + f.parts.reduce((n, p) => n + p.points, 0)).join(' '));
let html = read('index.html')
  .replace('/*__CSS__*/', () => read('styles.css') + '\n' + read('luau.css'))
  .replace('/*__CONTENT__*/', () => contentJs)
  .replace('/*__APP__*/', () => js.replace(/<\/(script)/gi, '<\\/$1'));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const f of ['firebase-config.js', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'firestore.rules', 'SETUP.md']) {
  if (fs.existsSync(path.join(ROOT, 'src', 'static', f))) fs.copyFileSync(path.join(ROOT, 'src', 'static', f), path.join(OUT, f));
}
console.log('built ' + path.join(OUT, 'index.html'), (html.length / 1024).toFixed(0) + ' KB');
