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
      if (/^```/.test(line)) { inFence = false; q.code = code.join('\n'); code = []; }
      else code.push(raw);
      continue;
    }
    let m;
    if ((m = line.match(/^Q:\s*(.*)$/))) { push(); q = { q: m[1], choices: [], a: -1 }; continue; }
    if (!q) continue;
    if ((m = line.match(/^```(\w*)/))) { inFence = true; q.lang = m[1] || 'text'; continue; }
    if ((m = line.match(/^- \[( |x)\] (.*)$/))) { if (m[1] === 'x') q.a = q.choices.length; q.choices.push(m[2]); continue; }
    if ((m = line.match(/^WHY:\s*(.*)$/))) { q.why = m[1]; continue; }
    if ((m = line.match(/^LINE:\s*(.*)$/))) { q.lines = m[1].split(',').map(s => parseInt(s.trim(), 10)); continue; }
    if ((m = line.match(/^FIX:\s*(.*)$/))) { q.fix = m[1]; continue; }
    if (line.trim() && !q.code && !q.choices.length && !q.why) q.q += ' ' + line.trim();
  }
  push();
  out.forEach((x, i) => {
    x.id = `${unitId}-${type[0]}${i + 1}`;
    x.kind = type === 'bug' ? 'bug' : type === 'fill' ? 'fill' : 'mcq';
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
      unit.lessons.push({ title: section.title, mins: section.mins, html: marked.parse(prepMd(md)), text, quizzes });
    } else {
      unit[section.type].push(...parseQuestions(buf, section.type, unit.id + (unit[section.type].length ? 'x' : '')));
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
      const [id, title] = m[1].split('|').map(s => s.trim());
      if (!course || UNITS_ALL[id]) { unit = UNITS_ALL[id]; if (!unit) errors.push('unknown unit ' + id); continue; }
      unit = { id, title, lessons: [], ex: [], fill: [], quiz: [], trace: [], bug: [] };
      UNITS_ALL[id] = unit; course.units.push(unit);
      continue;
    }
    if (!inFence && (m = line.match(/^### (LESSON|QUIZ|TRACE|BUG|EXERCISE|FILL)\b\s*(.*)$/))) {
      flush();
      const type = m[1].toLowerCase();
      section = { type };
      if (type === 'lesson') { const [t, mins] = m[2].split('|').map(s => s.trim()); section.title = t; section.mins = +mins || 10; }
      if (type === 'exercise') { const [t, lang, mins] = m[2].split('|').map(s => s.trim()); Object.assign(section, { title: t, lang, mins }); }
      if (type === 'fill') section.title = m[2].trim();
      continue;
    }
    buf.push(line);
  }
  flush();
  return course;
}

const files = fs.readdirSync(path.join(ROOT, 'content')).filter(f => f.endsWith('.md') && !/glossary/i.test(f)).sort();
const GLOSSARY = [];
for (const f of fs.readdirSync(path.join(ROOT, 'content')).filter(f => /glossary/i.test(f))) {
  for (const line of fs.readFileSync(path.join(ROOT, 'content', f), 'utf8').split('\n')) {
    const m = line.match(/^- \*\*(.+?)\*\*(?:\s*\(([^)]*)\))?\s*:\s*(.+)$/);
    if (m) GLOSSARY.push({ term: m[1].trim(), aliases: (m[2] || '').split(',').map(s => s.trim()).filter(Boolean), def: m[3].trim() });
  }
}
const courses = files.map(f => parseCourse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'), f)).filter(Boolean);

// stats
let nL = 0, nQ = 0, nT = 0, nB = 0, nU = 0, nE = 0, nF = 0;
for (const c of courses) for (const u of c.units) { nU++; nL += u.lessons.length; nQ += u.quiz.length; nT += u.trace.length; nB += u.bug.length; nE += u.ex.length; nF += u.fill.length; }
console.log(`courses ${courses.length}, units ${nU}, lessons ${nL}, quiz ${nQ}, trace ${nT}, bug ${nB}, exercises ${nE}, fill ${nF}`);
if (process.env.DUMP_EX) fs.writeFileSync(process.env.DUMP_EX, JSON.stringify(courses.flatMap(c => c.units.flatMap(u => u.ex))));
if (errors.length) { console.error('CONTENT ERRORS:\n' + errors.join('\n')); process.exit(1); }

const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const jsOrder = ['core.js', 'ui.js', 'glossary.js', 'runner.js', 'engine.js', 'views-learn.js', 'views-study.js', 'views-assign.js', 'views-arcade.js', 'squad.js', 'views-squad.js', 'views-me.js', 'main.js'];
const js = jsOrder.map(f => `// ---- ${f} ----\n` + read(f)).join('\n');
const contentJs = 'window.COURSES = ' + JSON.stringify(courses).replace(/<\/(script)/gi, '<\\/$1') + ';\nwindow.GLOSSARY = ' + JSON.stringify(GLOSSARY) + ';';
console.log('glossary terms', GLOSSARY.length);
let html = read('index.html')
  .replace('/*__CSS__*/', () => read('styles.css'))
  .replace('/*__CONTENT__*/', () => contentJs)
  .replace('/*__APP__*/', () => js.replace(/<\/(script)/gi, '<\\/$1'));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const f of ['firebase-config.js', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'firestore.rules', 'SETUP.md']) {
  if (fs.existsSync(path.join(ROOT, 'src', 'static', f))) fs.copyFileSync(path.join(ROOT, 'src', 'static', f), path.join(OUT, f));
}
console.log('built ' + path.join(OUT, 'index.html'), (html.length / 1024).toFixed(0) + ' KB');
