'use strict';
/* =========================================================
   Roots — Family Constellation
   Vanilla JS, no build step. Data is saved in localStorage.

   Data model (state.people[id]):
   { id, name, gender: 'm'|'f'|'o', birth, death, place, bio,
     photo (dataURL), parents: [id], spouses: [id] }
   Children are derived: anyone whose parents include you.
   ========================================================= */

const STORE_KEY = 'roots.family.v1';
const THEME_KEY = 'roots.theme';
const MODE_KEY = 'roots.mode';
const HIST_KEY = 'roots.history';
const R = 22;             // orb radius
const COL = 170;          // tree: horizontal spacing
const ROW = 170;          // tree: vertical spacing between generations
const LANE = 66;          // river: height of one life's lane
const PXY = 11;           // river: pixels per year
const TOP_UI = 76;        // space taken by the top bar
const BOTTOM_UI = 90;     // space taken by the time machine
const NOW = new Date().getFullYear();
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVGNS = 'http://www.w3.org/2000/svg';

const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const savedState = load();
let state = savedState || demoFamily();
let selectedId = null;
let mode = 'river';       // 'river' | 'orbit' | 'tree'
try { mode = localStorage.getItem(MODE_KEY) || 'river'; } catch { /* ignore */ }
let orbitCenter = null;
let yrs = {}, Y0 = NOW - 50;
let T = NOW;              // the year the time machine is showing
let playing = null;
let pos = {}, cur = {};   // target positions / currently drawn positions
let nodeEls = {}, hl = null, relCache = {};
let orbitRings = [], orbitFar = false, riverBounds = null, tweenRaf;
let histOn = true;        // show the history the family witnessed
try { histOn = localStorage.getItem(HIST_KEY) !== 'off'; } catch { /* ignore */ }
let famRegions = new Set(['world']), hEvents = [], hEras = [], skyLabel = null;
const view = { x: 0, y: 0, k: 1 };

/* ---------------------------------------------------------
   Storage
   --------------------------------------------------------- */
function normalize(s) {
  const out = { name: s.name || 'My Family', homeland: s.homeland || '', merged: [...(s.merged || [])], people: {} };
  Object.values(s.people || {}).forEach(p => {
    if (!p || !p.id) return;
    out.people[p.id] = {
      id: p.id, name: p.name || 'Unnamed', gender: ['m', 'f', 'o'].includes(p.gender) ? p.gender : 'o',
      birth: p.birth || '', death: p.death || '', place: p.place || '', bio: p.bio || '',
      photo: p.photo || '', parents: [...(p.parents || [])], spouses: [...(p.spouses || [])],
      estBirth: p.estBirth || ''   // rough guess, only used to place someone in time
    };
  });
  // drop references to people that don't exist
  Object.values(out.people).forEach(p => {
    p.parents = [...new Set(p.parents.filter(id => out.people[id] && id !== p.id))].slice(0, 2);
    p.spouses = [...new Set(p.spouses.filter(id => out.people[id] && id !== p.id))];
  });
  return out;
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.people) return normalize(s);
  } catch (e) { /* ignore */ }
  return null;
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Could not save — storage is full. Try smaller photos.'); }
}

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const person = id => state.people[id];
const all = () => Object.values(state.people);
const childrenOf = id => all().filter(p => p.parents.includes(id));
const siblingsOf = id => {
  const p = person(id);
  if (!p.parents.length) return [];
  return all().filter(o => o.id !== id && o.parents.some(q => p.parents.includes(q)));
};

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(w => /\p{L}/u.test(w));
  if (!parts.length) return '?';
  return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function lifespan(p) {
  if (p.birth && p.death) return `${p.birth} – ${p.death}`;
  if (p.birth) return `b. ${p.birth}`;
  if (p.death) return `d. ${p.death}`;
  return '';
}

function ageText(p) {
  const b = parseInt(p.birth, 10);
  if (!b) return '';
  const end = parseInt(p.death, 10) || new Date().getFullYear();
  const age = end - b;
  if (age < 0 || age > 130) return '';
  return p.death ? `lived ${age} years` : `${age} years old`;
}

function el(tag, attrs, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

let toastTimer;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------------------------------------------------------
   Demo family
   --------------------------------------------------------- */
function demoFamily() {
  const s = { name: 'The Demo Family', people: {} };
  const add = (name, gender, birth, death = '', extra = {}) => {
    const id = uid();
    s.people[id] = { id, name, gender, birth, death, place: '', bio: '', photo: '', parents: [], spouses: [], ...extra };
    return id;
  };
  const marry = (a, b) => { s.people[a].spouses.push(b); s.people[b].spouses.push(a); };
  const kid = (c, ...ps) => s.people[c].parents.push(...ps);

  const karim = add('Karim Aliev', 'm', '1938', '2015', { place: 'Samarkand', bio: 'Grew apricots and told the best stories.' });
  const zuhra = add('Zuhra Alieva', 'f', '1942', '2020', { bio: 'Her plov recipe is still a family secret.' });
  marry(karim, zuhra);

  const akmal = add('Akmal Aliev', 'm', '1964');
  const nodira = add('Nodira Alieva', 'f', '1967');
  const dilnoza = add('Dilnoza Rahimova', 'f', '1969');
  const rustam = add('Rustam Rahimov', 'm', '1966');
  const sardor = add('Sardor Aliev', 'm', '1974', '', { bio: 'The uncle who always brings sweets.' });
  [akmal, dilnoza, sardor].forEach(c => kid(c, karim, zuhra));
  marry(akmal, nodira); marry(dilnoza, rustam);

  const you = add('You ✦', 'm', '2005', '', { bio: 'Click "Edit" to make this you!' });
  const madina = add('Madina Alieva', 'f', '2000');
  [madina, you].forEach(c => kid(c, akmal, nodira));

  const bekzod = add('Bekzod Rahimov', 'm', '1995');
  const laylo = add('Laylo Rahimova', 'f', '1998');
  [bekzod, laylo].forEach(c => kid(c, dilnoza, rustam));

  const sevara = add('Sevara Rahimova', 'f', '1996');
  marry(bekzod, sevara);
  const amir = add('Amir Rahimov', 'm', '2022');
  kid(amir, bekzod, sevara);
  return s;
}

/* ---------------------------------------------------------
   Years: real ones where known, estimated from relatives
   otherwise (so everyone can sit on the river of time)
   --------------------------------------------------------- */
function computeYears() {
  const ps = all(), Y = {};
  ps.forEach(p => {
    const b = parseInt(p.birth, 10), d = parseInt(p.death, 10), e = parseInt(p.estBirth, 10);
    Y[p.id] = { b: b > 0 ? b : e > 0 ? e : null, d: d > 0 ? d : null, est: !(b > 0) };
  });
  for (let it = 0; it < 12; it++) {
    ps.forEach(p => {
      const y = Y[p.id];
      if (y.b) return;
      const par = p.parents.map(q => Y[q].b).filter(Boolean);
      const kid = childrenOf(p.id).map(c => Y[c.id].b).filter(Boolean);
      const sp = p.spouses.map(s => Y[s].b).filter(Boolean);
      if (par.length) y.b = Math.max(...par) + 27;
      else if (kid.length) y.b = Math.min(...kid) - 27;
      else if (sp.length) y.b = sp[0];
    });
  }
  const known = ps.map(p => Y[p.id].b).filter(Boolean);
  const fallback = known.length ? Math.round(avg(known)) : NOW - 30;
  ps.forEach(p => {
    const y = Y[p.id];
    y.b = Math.min(y.b || fallback, NOW);
    if (y.d && y.d < y.b) y.d = null;
    // nobody born over a century ago is still flowing: guess a lifetime
    if (!y.d && NOW - y.b > 105) { y.d = y.b + 65; y.dEst = true; }
    y.end = Math.min(y.d || NOW, NOW);
  });
  return Y;
}

const yx = year => (year - Y0) * PXY;      // river: year → x
const firstName = n => String(n).split(/\s+/)[0];

function spousePairs() {
  const out = [], seen = new Set();
  all().forEach(p => p.spouses.forEach(s => {
    const k = [p.id, s].sort().join('|');
    if (seen.has(k) || !person(s)) return;
    seen.add(k);
    out.push([p.id, s]);
  }));
  return out;
}

/* When two rivers braid together: just before their first child, or a guess */
function unionYear(a, b) {
  const common = childrenOf(a).filter(k => k.parents.includes(b)).map(k => yrs[k.id].b);
  const m = common.length ? Math.min(...common) - 1 : Math.max(yrs[a].b, yrs[b].b) + 24;
  return Math.min(m, yrs[a].end, yrs[b].end);
}

function defaultCenter() {
  return (all().find(p => p.name.includes('✦')) || all()[0])?.id || null;
}

/* ---------------------------------------------------------
   Layout 1 — River of Time
   x = year, every life is a lane; children flow out of
   their parents' lanes, partners sit side by side
   --------------------------------------------------------- */
function layoutRiver() {
  const ps = all();
  if (!ps.length) return {};
  const order = [], placed = new Set();
  const byBirth = (a, b) => yrs[a].b - yrs[b].b;
  const place = id => { placed.add(id); order.push(id); };
  const visit = id => {
    if (placed.has(id)) return;
    place(id);
    const couple = [id];
    person(id).spouses.filter(s => !person(s).parents.length && !placed.has(s)).sort(byBirth)
      .forEach(s => { place(s); couple.push(s); });
    [...new Set(couple.flatMap(c => childrenOf(c).map(k => k.id)))].sort(byBirth).forEach(visit);
  };
  ps.filter(p => !p.parents.length && !p.spouses.some(s => person(s).parents.length))
    .map(p => p.id).sort(byBirth).forEach(visit);
  ps.map(p => p.id).sort(byBirth).forEach(visit);

  const out = {};
  order.forEach((id, i) => (out[id] = { x: yx(yrs[id].b), y: i * LANE }));
  return out;
}

/* ---------------------------------------------------------
   Layout 2 — Orbit
   one person is the sun; everyone else circles them on
   rings by how many steps away they are
   --------------------------------------------------------- */
function layoutOrbit() {
  const ps = all();
  orbitRings = []; orbitFar = false;
  if (!ps.length) return {};
  if (!person(orbitCenter)) orbitCenter = defaultCenter();
  const c = orbitCenter;
  const dist = { [c]: 0 }, kids = { [c]: [] }, q = [c];
  while (q.length) {
    const id = q.shift(), p = person(id);
    const nb = [...p.parents, ...p.spouses,
      ...childrenOf(id).sort((a, b) => yrs[a.id].b - yrs[b.id].b).map(k => k.id)];
    nb.forEach(n => {
      if (dist[n] !== undefined) return;
      dist[n] = dist[id] + 1; kids[id].push(n); kids[n] = []; q.push(n);
    });
  }
  // each branch gets a slice of the circle sized by how much family hangs off it
  const w = {};
  const weigh = id => (w[id] = 1 + kids[id].reduce((s, k) => s + weigh(k), 0) * 0.55);
  weigh(c);
  const ang = {};
  const assign = (id, a0, a1) => {
    ang[id] = (a0 + a1) / 2;
    const tot = kids[id].reduce((s, k) => s + w[k], 0);
    let a = a0;
    kids[id].forEach(k => { const span = (a1 - a0) * w[k] / tot; assign(k, a, a + span); a += span; });
  };
  assign(c, 0, Math.PI * 2);
  const first = person(c).parents[0] || kids[c][0];
  const rot = first ? -Math.PI / 2 - ang[first] : 0;    // ancestors rise to the top

  const maxD = Math.max(...Object.values(dist));
  const count = Array(maxD + 1).fill(0);
  Object.values(dist).forEach(d => count[d]++);
  let prev = 0;
  for (let d = 1; d <= maxD; d++) {
    const r = Math.max(prev + 115, d === 1 ? 160 : 0, count[d] * 130 / (Math.PI * 2));
    orbitRings.push(r); prev = r;
  }
  const far = ps.filter(p => dist[p.id] === undefined).map(p => p.id);
  if (far.length) {
    orbitRings.push(Math.max(prev + 140, far.length * 130 / (Math.PI * 2)));
    orbitFar = true;
    far.forEach((id, i) => { ang[id] = (i / far.length) * Math.PI * 2 - rot; dist[id] = orbitRings.length; });
  }
  const out = {};
  ps.forEach(p => {
    const d = dist[p.id], r = d ? orbitRings[d - 1] : 0, a = ang[p.id] + rot;
    out[p.id] = { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
  return out;
}

/* ---------------------------------------------------------
   Layout 3 — Classic tree (generations + barycenter ordering)
   --------------------------------------------------------- */
function layoutTree() {
  const ps = all();
  if (!ps.length) return {};
  const kids = {};
  ps.forEach(p => (kids[p.id] = []));
  ps.forEach(p => p.parents.forEach(q => kids[q] && kids[q].push(p.id)));

  // 1. generation numbers (children below parents, partners on the same row)
  const gen = {};
  ps.forEach(p => (gen[p.id] = 0));
  for (let it = 0; it < ps.length * 2 + 5; it++) {
    let changed = false;
    ps.forEach(p => {
      let g = gen[p.id];
      p.parents.forEach(q => (g = Math.max(g, gen[q] + 1)));
      p.spouses.forEach(s => (g = Math.max(g, gen[s])));
      if (!p.parents.length && kids[p.id].length) {
        g = Math.max(g, Math.min(...kids[p.id].map(c => gen[c])) - 1);
      }
      if (g !== gen[p.id]) { gen[p.id] = g; changed = true; }
    });
    if (!changed) break;
  }

  const maxG = Math.max(...Object.values(gen));
  const rows = Array.from({ length: maxG + 1 }, () => []);
  ps.forEach(p => rows[gen[p.id]].push(p.id));
  const x = {};
  rows.forEach(r => r.forEach((id, i) => (x[id] = i * COL)));

  const keyOf = (id, mode) => {
    const par = person(id).parents.map(q => x[q]).filter(v => v !== undefined);
    const ch = kids[id].map(c => x[c]);
    if (mode === 'down' && par.length) return avg(par);
    if (mode === 'up' && ch.length) return avg(ch);
    if (par.length) return avg(par);
    if (ch.length) return avg(ch);
    return x[id];
  };

  // 2. order one row, keeping couples together and families centred
  const arrange = (gi, mode) => {
    const row = rows[gi];
    if (!row.length) return;
    const key = {}, marriedIn = {};
    row.forEach(id => (key[id] = keyOf(id, mode)));
    row.forEach(id => {
      const p = person(id);
      if (p.parents.length) return;
      const s = p.spouses.find(s => gen[s] === gi && person(s).parents.length);
      if (s) { key[id] = key[s]; marriedIn[id] = true; }
    });
    const sorted = [...row].sort((a, b) =>
      (key[a] - key[b]) || ((marriedIn[a] ? 1 : 0) - (marriedIn[b] ? 1 : 0)) || (x[a] - x[b]));

    const order = [], fam = {}, used = new Set();
    sorted.forEach(id => {
      if (used.has(id)) return;
      used.add(id); order.push(id); fam[id] = key[id];
      person(id).spouses.forEach(s => {
        if (gen[s] === gi && !used.has(s)) { used.add(s); order.push(s); fam[s] = key[id]; }
      });
    });

    const des = {};
    for (let i = 0; i < order.length;) {
      let j = i;
      while (j < order.length && Math.abs(fam[order[j]] - fam[order[i]]) < 1) j++;
      const n = j - i;
      for (let t = i; t < j; t++) des[order[t]] = fam[order[i]] + (t - i - (n - 1) / 2) * COL;
      i = j;
    }
    let prev = -Infinity, drift = 0;
    order.forEach(id => {
      const v = Math.max(des[id], prev + COL);
      x[id] = v; prev = v; drift += v - des[id];
    });
    const shift = drift / order.length;
    order.forEach(id => (x[id] -= shift));
    rows[gi] = order;
  };

  for (let r = 0; r < 4; r++) {
    for (let g = 0; g <= maxG; g++) arrange(g, 'down');
    for (let g = maxG; g >= 0; g--) arrange(g, 'up');
  }
  for (let g = 0; g <= maxG; g++) arrange(g, 'down');

  const out = {};
  ps.forEach(p => (out[p.id] = { x: x[p.id], y: gen[p.id] * ROW }));
  return out;
}

/* ---------------------------------------------------------
   Drawing
   --------------------------------------------------------- */
const isBorn = id => T >= yrs[id].b;
const isGone = id => !!yrs[id].d && T > yrs[id].d;
const timeActive = () => T < NOW;

function subtitle(p) {
  const y = yrs[p.id];
  let base;
  if (mode === 'orbit') {
    base = p.id === orbitCenter ? '◉ centre of the orbit'
      : (relCache[p.id] ??= relationship(orbitCenter, p.id) || 'not connected');
  } else base = lifespan(p) || p.place;
  if (!timeActive()) return base;
  const when = T < y.b ? 'not born yet' : isGone(p.id) ? `† ${y.dEst ? '~' : ''}${y.d}` : `age ${y.est ? '~' : ''}${T - y.b}`;
  return mode === 'orbit' && p.id !== orbitCenter ? `${base} · ${when}` : when;
}

/* ---------------------------------------------------------
   History — the world events each life witnessed,
   chosen by where the family comes from
   --------------------------------------------------------- */
function computeHistory() {
  famRegions = new Set(['world']);
  all().forEach(p => regionsOf(p.place).forEach(r => famRegions.add(r)));
  regionsOf(state.homeland).forEach(r => famRegions.add(r));
  hEvents = HISTORY_EVENTS.filter(e => historyMatters(e, famRegions) && e.y >= Y0 && e.y <= NOW);
  hEras = HISTORY_ERAS.filter(e => historyMatters(e, famRegions) && e.y2 >= Y0 && e.y1 <= NOW)
    .sort((a, b) => a.y1 - b.y1);
}

/* someone born somewhere we recognise sees that region's history; otherwise the family's */
function personRegions(p) {
  const r = regionsOf(p.place);
  return r.size ? new Set([...r, 'world']) : famRegions;
}

function witnesses(ev) {
  return all().filter(p => {
    const y = yrs[p.id];
    return y.b <= ev.y && (!y.d || y.d >= ev.y) && historyMatters(ev, personRegions(p));
  }).sort((a, b) => yrs[a.id].b - yrs[b.id].b);
}

function witnessText(ev, list) {
  const names = list.slice(0, 4).map(p => `${esc(firstName(p.name))} (${ev.y - yrs[p.id].b})`);
  return names.join(', ') + (list.length > 4 ? ` +${list.length - 4} more` : '');
}

/* the era that defines a year: wars first, then local history over global */
function erasAt(y) {
  return hEras.filter(e => e.y1 <= y && y <= e.y2)
    .sort((a, b) => (b.p - a.p) || ((a.r.includes('world') ? 1 : 0) - (b.r.includes('world') ? 1 : 0)));
}

/* the era colours the whole screen, quietly */
function updateEpoch() {
  const box = $('#epoch');
  box.hidden = !histOn || !all().length;
  if (box.hidden) return;
  const [era] = erasAt(T);
  $('#epTint').style.backgroundColor = era ? ERA_COLORS[era.k] : 'transparent';
}

/* whose sky are we under? the selected person's birthplace, else where most of the family lives */
function skyPlace() {
  const known = p => p.place && latitudeOf(p.place) !== null;
  const sel = selectedId && person(selectedId);
  if (sel && known(sel)) return sel.place;
  const count = list => {
    const n = {};
    list.filter(known).forEach(p => (n[p.place] = (n[p.place] || 0) + 1));
    return Object.keys(n).sort((a, b) => n[b] - n[a])[0];
  };
  return count(all().filter(p => isBorn(p.id) && !isGone(p.id))) || count(all()) ||
    (latitudeOf(state.homeland) !== null ? state.homeland : null);
}

function updateSky() {
  skyLabel = skyPlace();
  realSky.set({ year: T, lat: skyLabel ? latitudeOf(skyLabel) : 41 });
  sky.refresh();
}

let headlineTimer;
function showHeadline(ev, list) {
  const h = $('#headline');
  h.innerHTML = `<small>${ev.y} · history</small><strong>${ev.i} ${esc(ev.t)}</strong>` +
    (list.length ? `<span>witnessed by ${witnessText(ev, list)}</span>` : '<span>before anyone in the family was born</span>');
  h.classList.remove('show'); void h.offsetWidth; h.classList.add('show');
  clearTimeout(headlineTimer);
  headlineTimer = setTimeout(() => h.classList.remove('show'), 3200);
}

function jumpToHistory(y) {
  stopPlay();
  setTime(y);
  const ev = hEvents.find(e => e.y === y) || HISTORY_EVENTS.find(e => e.y === y);
  if (ev) showHeadline(ev, witnesses(ev));
}

/* stack era bars into as few rows as possible without labels colliding */
function eraTracks() {
  const ends = [];
  const out = hEras.map(e => {
    const x1 = yx(Math.max(e.y1, Y0)), x2 = yx(Math.min(e.y2, NOW)), w = Math.max(x2 - x1, 4);
    const labelW = e.t.length * 6.4 + 16, inside = labelW < w;
    let track = ends.findIndex(end => end < x1);
    if (track < 0) { track = ends.length; ends.push(0); }
    ends[track] = x1 + (inside ? w : w + labelW) + 8;
    return { e, x1, x2, w, inside, track };
  });
  return { list: out, count: ends.length };
}

function drawHistory(g, tracks) {
  const { top, bot } = riverBounds;
  // eras: tinted bands behind the rivers + labelled bars under the years
  tracks.list.forEach(({ e, x1, x2, w, inside, track }) => {
    if (e.k === 'war' || e.k === 'hard') {
      el('rect', { class: `era-band k-${e.k}`, x: x1, y: top, width: w, height: bot - top, style: `fill:${ERA_COLORS[e.k]}` }, g);
    }
    const y = top + 6 + track * 18;
    const bar = el('g', { class: 'era' }, g);
    el('rect', { class: 'era-bar', x: x1, y, width: w, height: 14, rx: 7, style: `fill:${ERA_COLORS[e.k]}` }, bar);
    el('text', { class: `era-label${inside ? ' in' : ''}`, x: inside ? x1 + 8 : x2 + 6, y: y + 10.5 }, bar).textContent = e.t;
    el('title', {}, bar).textContent = `${e.t} (${e.y1}–${e.y2 > NOW ? 'today' : e.y2}) — ${e.d}`;
  });

  // events: a medallion above the river and a faint line down through every life
  const rows = [0, 1, 2, 3, 4, 5].map(i => ({ y: top - 38 - i * 20, end: -Infinity, dot: -Infinity }));
  hEvents.forEach(ev => {
    const x = yx(ev.y), labelW = ev.t.length * 6 + 24;
    let row = rows.find(r => r.end < x - 12);
    const labelled = !!row;
    // no room for a label: tuck the medallion where it only touches other medallions
    if (!row) row = rows.find(r => r.dot < x - 22 && r.end < x + 10) || rows.reduce((a, b) => (a.end < b.end ? a : b));
    row.end = Math.max(row.end, x + (labelled ? labelW : 12));
    row.dot = x;
    const h = el('g', { class: `hist${labelled ? '' : ' nolabel'}`, 'data-y': ev.y }, g);
    el('line', { class: 'hist-line', x1: x, x2: x, y1: row.y + 10, y2: bot }, h);
    el('circle', { class: 'hist-dot', cx: x, cy: row.y, r: 10 }, h);
    el('text', { class: 'hist-icon', x, y: row.y + 0.5 }, h).textContent = ev.i;
    el('text', { class: 'hist-title', x: x + 15, y: row.y + 4 }, h).textContent = ev.t;
    el('title', {}, h).textContent = `${ev.y} — ${ev.t}`;
  });
}

function drawBack() {
  const g = $('#back');
  g.replaceChildren();
  const ids = Object.keys(pos);
  if (!ids.length) return;
  if (mode === 'river') {
    const ys = ids.map(i => pos[i].y);
    const tracks = histOn ? eraTracks() : { list: [], count: 0 };
    riverBounds = { top: Math.min(...ys) - 64 - tracks.count * 18, bot: Math.max(...ys) + 44 };
    for (let yr = Math.ceil(Y0 / 10) * 10; yr <= NOW; yr += 10) {
      el('line', { class: 'grid', x1: yx(yr), x2: yx(yr), y1: riverBounds.top, y2: riverBounds.bot }, g);
      el('text', { class: 'grid-label', x: yx(yr), y: riverBounds.top - 10 }, g).textContent = yr;
    }
    if (histOn) drawHistory(g, tracks);
  } else if (mode === 'orbit') {
    el('circle', { class: 'core', r: 70 }, g);
    orbitRings.forEach((r, i) => {
      el('circle', { class: 'orbit-ring', r, style: `animation-duration:${90 + i * 40}s` }, g);
      const far = orbitFar && i === orbitRings.length - 1;
      el('text', { class: 'ring-label', x: -r * 0.707 - 6, y: r * 0.707 + 6, 'text-anchor': 'end' }, g)
        .textContent = far ? 'not connected' : `${i + 1} step${i ? 's' : ''} away`;
    });
  }
}

function drawNodes() {
  const g = $('#nodes');
  g.replaceChildren();
  nodeEls = {};
  all().forEach(p => {
    const n = el('g', {
      class: `node g-${p.gender}`, 'data-id': p.id, tabindex: 0, role: 'button', 'aria-label': p.name
    }, g);
    const orb = el('g', { class: 'orb' }, n);
    el('circle', { class: 'halo', r: R + 12 }, orb);
    el('circle', { class: 'ring', r: R + 3 }, orb);
    if (p.photo) {
      el('image', {
        href: p.photo, x: -R, y: -R, width: R * 2, height: R * 2,
        'clip-path': 'url(#avatarClip)', preserveAspectRatio: 'xMidYMid slice'
      }, orb);
    } else {
      el('circle', { class: 'avatar-bg', r: R }, orb);
      el('text', { class: 'initials', y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, orb)
        .textContent = initials(p.name);
    }
    const big = mode === 'orbit' && p.id === orbitCenter ? 12 : 0;
    const L = mode === 'river'
      ? { x: R + 10, y1: -11, y2: 24, a: 'start' }
      : { x: 0, y1: R + 20 + big, y2: R + 36 + big, a: 'middle' };
    el('text', { class: 'name', x: L.x, y: L.y1, 'text-anchor': L.a }, n).textContent = trunc(p.name || 'Unnamed', 18);
    const sub = el('text', { class: 'sub', x: L.x, y: L.y2, 'text-anchor': L.a }, n);
    nodeEls[p.id] = { g: n, sub };
  });
}

function placeNodes() {
  for (const id in nodeEls) {
    const c = cur[id];
    if (c) nodeEls[id].g.setAttribute('transform', `translate(${c.x},${c.y})`);
  }
}

function drawLinks() {
  const g = $('#links');
  g.replaceChildren();
  if (!all().length) return;
  const P = id => cur[id];
  const mk = (tag, attrs, ends) => {
    const n = el(tag, attrs, g);
    if (hl && ends) n.classList.add(ends.every(e => hl.has(e)) ? 'lit' : 'dim');
    return n;
  };

  if (mode === 'river') {
    // the "now" line
    if (riverBounds) {
      const x = yx(T);
      const lift = histOn ? 170 : 30;
      el('line', { class: 'cursor', x1: x, x2: x, y1: riverBounds.top - lift + 8, y2: riverBounds.bot }, g);
      el('text', { class: 'cursor-label', x, y: riverBounds.top - lift }, g).textContent = T === NOW ? `today · ${T}` : T;
    }
    // tributaries: a child's river flows out of each parent's
    all().forEach(c => {
      const cp = P(c.id);
      if (!cp || !isBorn(c.id)) return;
      c.parents.forEach(pid => {
        const pp = P(pid);
        if (!pp || !isBorn(pid)) return;
        const sx = Math.max(cp.x - 80, pp.x);
        mk('path', {
          class: `link child g-${c.gender}`,
          d: `M${sx},${pp.y} C${cp.x - 20},${pp.y} ${cp.x - 50},${cp.y} ${cp.x - R},${cp.y}`
        }, [pid, c.id]);
      });
    });
    // the rivers themselves
    all().forEach(p => {
      const c = P(p.id), y = yrs[p.id];
      if (!c || !isBorn(p.id)) return;
      const ended = !!y.d && T >= y.d;
      const w = (Math.min(y.end, T) - y.b) * PXY;
      if (w > 0) {
        mk('rect', {
          class: 'ribbon', x: c.x, y: c.y - 6, width: w, height: 12, rx: 6,
          fill: `url(#${ended ? 'fade' : 'rib'}-${p.gender})`
        }, [p.id]);
      }
      if (!ended) {
        const bx = c.x + w;
        mk('circle', { class: `bead g-${p.gender}`, cx: bx, cy: c.y, r: 11 }, [p.id]);
        mk('text', { class: 'bead-age', x: bx, y: c.y + 0.5 }, [p.id]).textContent = (y.est ? '~' : '') + (T - y.b);
      }
    });
    // witness marks: where a life crossed a moment in history. The selected
    // person always shows theirs; everyone lights up as the time machine passes one.
    if (histOn) {
      hEvents.forEach(ev => {
        const live = timeActive() && T >= ev.y && T - ev.y < 4;
        if (!live && !selectedId) return;
        all().forEach(p => {
          const c = P(p.id), y = yrs[p.id];
          if (!c || (!live && p.id !== selectedId)) return;
          if (ev.y < y.b || ev.y > Math.min(y.end, T) || !historyMatters(ev, personRegions(p))) return;
          mk('circle', { class: `witness${live ? ' live' : ''}`, cx: c.x + (ev.y - y.b) * PXY, cy: c.y, r: live ? 5 : 3.5 }, [p.id]);
        });
      });
    }
    // braids where two rivers join
    spousePairs().forEach(([a, b]) => {
      const m = unionYear(a, b);
      if (T < m || !P(a) || !P(b)) return;
      const x = P(a).x + (m - yrs[a].b) * PXY, ya = P(a).y, yb = P(b).y, dy = yb - ya;
      mk('path', {
        class: 'link spouse braid',
        d: `M${x},${ya} C${x + 22},${ya + dy * 0.35} ${x - 22},${ya + dy * 0.65} ${x},${yb}`
      }, [a, b]);
      mk('text', { class: 'knot', x: x + 14, y: ya + dy / 2 }, [a, b]).textContent = '♥';
    });
    return;
  }

  const shown = id => P(id) && isBorn(id);

  if (mode === 'orbit') {
    // gentle arcs that bow toward the centre of the system
    const arc = (a, b) => {
      const cx = (a.x + b.x) / 2 * 0.78, cy = (a.y + b.y) / 2 * 0.78;
      return { d: `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`, mx: a.x / 4 + cx / 2 + b.x / 4, my: a.y / 4 + cy / 2 + b.y / 4 };
    };
    spousePairs().forEach(([a, b]) => {
      if (!shown(a) || !shown(b)) return;
      const k = arc(P(a), P(b));
      mk('path', { class: 'link spouse', d: k.d }, [a, b]);
      mk('text', { class: 'knot', x: k.mx, y: k.my }, [a, b]).textContent = '♥';
    });
    all().forEach(c => c.parents.forEach(pid => {
      if (!shown(c.id) || !shown(pid)) return;
      mk('path', { class: 'link child', d: arc(P(pid), P(c.id)).d }, [pid, c.id]);
    }));
    return;
  }

  // classic tree
  const adjacent = (a, b) => Math.abs(P(a).y - P(b).y) < 1 && Math.abs(P(a).x - P(b).x) < COL * 1.5;
  spousePairs().forEach(([ia, ib]) => {
    if (!shown(ia) || !shown(ib)) return;
    if (P(ia).x > P(ib).x) [ia, ib] = [ib, ia];
    const a = P(ia), b = P(ib);
    if (adjacent(ia, ib)) {
      mk('path', { class: 'link spouse', d: `M${a.x + R + 5},${a.y} L${b.x - R - 5},${b.y}` }, [ia, ib]);
      mk('text', { class: 'knot', x: (a.x + b.x) / 2, y: a.y }, [ia, ib]).textContent = '♥';
    } else {
      mk('path', {
        class: 'link spouse',
        d: `M${a.x},${a.y + R + 44} C${a.x},${a.y + R + 110} ${b.x},${b.y + R + 110} ${b.x},${b.y + R + 44}`
      }, [ia, ib]);
    }
  });
  all().forEach(c => {
    const cp = P(c.id);
    const ps = c.parents.filter(shown);
    if (!cp || !isBorn(c.id) || !ps.length) return;
    const draw = (sx, sy, ids) => {
      const ty = cp.y - R - 6, my = (sy + ty) / 2;
      mk('path', { class: 'link child', d: `M${sx},${sy} C${sx},${my} ${cp.x},${my} ${cp.x},${ty}` }, [...ids, c.id]);
    };
    if (ps.length === 2 && person(ps[0]).spouses.includes(ps[1]) && adjacent(ps[0], ps[1])) {
      draw((P(ps[0]).x + P(ps[1]).x) / 2, P(ps[0]).y + 10, ps);
    } else {
      ps.forEach(pid => draw(P(pid).x, P(pid).y + R + 44, [pid]));
    }
  });
}

/* Light up the selected person's whole bloodline */
function lineage(id) {
  const set = new Set([id]);
  const up = [id];
  while (up.length) person(up.pop()).parents.forEach(q => { if (!set.has(q)) { set.add(q); up.push(q); } });
  const down = [id];
  const seenDown = new Set([id]);
  while (down.length) childrenOf(down.pop()).forEach(c => { if (!seenDown.has(c.id)) { seenDown.add(c.id); set.add(c.id); down.push(c.id); } });
  person(id).spouses.forEach(s => set.add(s));
  return set;
}

function updateHighlight() {
  hl = selectedId && mode !== 'orbit' ? lineage(selectedId) : null;
  for (const id in nodeEls) {
    const n = nodeEls[id].g;
    n.classList.toggle('selected', id === selectedId);
    n.classList.toggle('dim', !!hl && !hl.has(id));
    n.classList.toggle('center', mode === 'orbit' && id === orbitCenter);
  }
  drawLinks();
}

/* Move everyone from where they are to where the new layout wants them */
function tweenTo(morph = false) {
  cancelAnimationFrame(tweenRaf);
  const from = {};
  for (const id in pos) from[id] = cur[id] || pos[id];
  const ms = REDUCE_MOTION || !Object.keys(cur).length ? 0 : morph ? 900 : 650;
  const links = $('#links');
  links.classList.toggle('morph', morph && ms > 0);
  const t0 = performance.now();
  const step = now => {
    const t = ms ? Math.min(1, (now - t0) / ms) : 1;
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    cur = {};
    for (const id in pos) {
      const a = from[id], b = pos[id];
      cur[id] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
    }
    placeNodes();
    if (!morph || t === 1) drawLinks();
    if (t < 1) tweenRaf = requestAnimationFrame(step);
    else links.classList.remove('morph');
  };
  step(t0);
}

function generations() {
  let max = 0;
  all().forEach(p => ancestorsOf(p.id).forEach(d => (max = Math.max(max, d))));
  return all().length ? max + 1 : 0;
}

function renderStats() {
  const ps = all();
  const gens = generations();
  const years = ps.map(p => parseInt(p.birth, 10)).filter(Boolean);
  const earliest = years.length ? Math.min(...years) : null;
  const alive = ps.filter(p => isBorn(p.id) && !isGone(p.id)).length;
  $('#stats').innerHTML = `
    <span><b>${ps.length}</b> ${ps.length === 1 ? 'person' : 'people'}</span>
    <span><b>${gens}</b> generation${gens === 1 ? '' : 's'}</span>
    ${earliest ? `<span>since <b>${earliest}</b></span>` : ''}
    ${timeActive() ? `<span><b>${alive}</b> alive in ${T}</span>` : ''}
    ${document.documentElement.dataset.theme === 'cosmos' ? `<span class="sky-note" title="The real stars as seen from here in ${T}">✦ sky over <b>${esc(skyLabel || 'the world')}</b>${realSky.milkyWayVisible() ? ' · Milky Way visible' : ''}</span>` : ''}`;
}

function render(morph = false) {
  yrs = computeYears();
  const bs = Object.values(yrs).map(y => y.b);
  Y0 = bs.length ? Math.floor((Math.min(...bs) - 4) / 10) * 10 : NOW - 50;
  T = clamp(T, Y0, NOW);
  computeHistory();
  pos = mode === 'river' ? layoutRiver() : mode === 'orbit' ? layoutOrbit() : layoutTree();
  relCache = {};
  for (const id in cur) if (!pos[id]) delete cur[id];
  svg.dataset.mode = mode;
  document.querySelectorAll('#modes [data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  drawBack();
  drawNodes();
  syncTimeline();
  applyTime(false);
  updateHighlight();
  tweenTo(morph);
  renderPanel();
  $('#empty').hidden = all().length > 0;
  $('#timebar').hidden = !all().length;
  $('#subtitle').textContent = state.name;
  document.title = `${state.name} — Roots`;
}

function setMode(m) {
  if (m === mode || !['river', 'orbit', 'tree'].includes(m)) return;
  mode = m;
  try { localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ }
  if (m === 'orbit' && selectedId) orbitCenter = selectedId;
  render(true);
  fit();
}
document.querySelectorAll('#modes [data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

/* ---------------------------------------------------------
   Time machine — scrub through the years or play the
   family's story like a film
   --------------------------------------------------------- */
function syncTimeline() {
  const r = $('#tRange');
  r.min = Y0; r.max = NOW; r.value = T;
  const span = NOW - Y0 || 1;
  $('#tTicks').innerHTML = all().map(p => {
    const y = yrs[p.id];
    return y.est ? '' : `<i class="g-${p.gender}" style="left:${((y.b - Y0) / span) * 100}%" title="${esc(p.name)} · ${y.b}"></i>`;
  }).join('');
}

function applyTime(redraw = true) {
  for (const id in nodeEls) {
    const n = nodeEls[id];
    n.g.classList.toggle('unborn', !isBorn(id));
    n.g.classList.toggle('gone', isGone(id));
    n.sub.textContent = subtitle(person(id));
  }
  const alive = all().filter(p => isBorn(p.id) && !isGone(p.id)).length;
  $('#tRange').value = T;
  $('#tYear').textContent = T;
  $('#tInfo').textContent = T === NOW ? 'today' : `${alive} alive`;
  $('#timebar').classList.toggle('past', timeActive());
  document.querySelectorAll('#back .hist').forEach(h => {
    const y = +h.dataset.y;
    h.classList.toggle('live', timeActive() && T >= y && T - y < 4);
  });
  updateEpoch();
  updateSky();
  renderStats();
  if (redraw) drawLinks();
}

function eventsIn(Y) {
  const ev = [];
  const pick = (g, m, f, o) => (g === 'm' ? m : g === 'f' ? f : o);
  all().forEach(p => {
    const y = yrs[p.id];
    if (y.b === Y && !y.est) {
      const ps = p.parents.map(q => firstName(person(q).name));
      ev.push({ id: p.id, icon: '✦', born: true,
        html: `<b>${esc(p.name)}</b> is born${ps.length ? ` to ${esc(ps.join(' & '))}` : ''}${p.place ? ` in ${esc(p.place)}` : ''}` });
    }
    if (y.d === Y && !y.dEst) {
      ev.push({ id: p.id, icon: '🕯', html: `<b>${esc(p.name)}</b> passes away${y.est ? '' : `, aged ${Y - y.b}`}` });
    }
    const gk = childrenOf(p.id).flatMap(c => childrenOf(c.id)).map(c => yrs[c.id]).filter(g => !g.est).map(g => g.b);
    if (gk.length && Math.min(...gk) === Y && (!y.d || y.d >= Y)) {
      ev.push({ id: p.id, icon: '❀', html: `<b>${esc(p.name)}</b> becomes a grand${pick(p.gender, 'father', 'mother', 'parent')}` });
    }
  });
  spousePairs().forEach(([a, b]) => {
    if (unionYear(a, b) === Y) {
      ev.push({ id: a, icon: '♥', html: `<b>${esc(firstName(person(a).name))}</b> &amp; <b>${esc(firstName(person(b).name))}</b> — two rivers join` });
    }
  });
  // history, told through the eyes of whoever was alive to see it
  if (histOn) {
    hEvents.filter(e => e.y === Y).forEach(e => {
      const w = witnesses(e);
      if (w.length) ev.push({ id: w[0].id, icon: e.i, hist: e, witnesses: w, html: `<b>${esc(e.t)}</b> — witnessed by ${witnessText(e, w)}` });
    });
  }
  return ev;
}

function chronicle(Y, ev) {
  const box = $('#chronicle');
  ev.forEach(e => {
    const d = document.createElement('button');
    d.className = 'ev';
    d.dataset.goto = e.id;
    d.innerHTML = `<span class="ev-yr">${Y}</span><span class="ev-ic">${e.icon}</span><span>${e.html}</span>`;
    box.appendChild(d);
  });
  while (box.children.length > 4) box.firstElementChild.remove();
}
$('#chronicle').addEventListener('click', e => {
  const b = e.target.closest('[data-goto]');
  if (b && person(b.dataset.goto)) select(b.dataset.goto, true);
});

function setTime(y, narrate = false) {
  T = clamp(Math.round(y), Y0, NOW);
  applyTime();
  if (!narrate) return [];
  const ev = eventsIn(T);
  chronicle(T, ev);
  const h = ev.find(e => e.hist);
  if (h) showHeadline(h.hist, h.witnesses);
  ev.filter(e => e.born).forEach(e => {
    const n = nodeEls[e.id]?.g;
    if (!n) return;
    n.classList.remove('born'); void n.getBBox(); n.classList.add('born');
    setTimeout(() => n.classList.remove('born'), 1400);
  });
  // in the river, the camera follows the "now" line
  if (mode === 'river') {
    const sx = view.x + yx(T) * view.k;
    if (sx > innerWidth * 0.7 || sx < 60) animateTo({ k: view.k, y: view.y, x: innerWidth * 0.35 - yx(T) * view.k }, 700);
  }
  return ev;
}

function play() {
  if (playing) return stopPlay();
  if (!all().length) return;
  if (T >= NOW) { T = Y0; fit(); }
  $('#chronicle').replaceChildren();
  $('#tPlay').textContent = '❚❚';
  $('#tPlay').setAttribute('aria-label', 'Pause');
  const tick = () => {
    if (T >= NOW) return stopPlay(true);
    const ev = setTime(T + 1, true);
    // linger on years where something happened — longest on history
    playing = setTimeout(tick, ev.some(e => e.hist) ? 1900 : ev.length ? 1100 : 130);
  };
  playing = setTimeout(tick, 300);
}

function stopPlay(finished = false) {
  clearTimeout(playing);
  playing = null;
  $('#tPlay').textContent = '▶';
  $('#tPlay').setAttribute('aria-label', 'Play');
  if (finished) toast('…and the story continues with you ✦');
}

$('#tPlay').onclick = play;
$('#tRange').addEventListener('input', e => { stopPlay(); setTime(+e.target.value); });
$('#tHist').onclick = toggleHistory;
function toggleHistory() {
  histOn = !histOn;
  try { localStorage.setItem(HIST_KEY, histOn ? 'on' : 'off'); } catch { /* ignore */ }
  $('#tHist').classList.toggle('on', histOn);
  render();
  if (mode === 'river') fit();
  toast(histOn ? '🏛 History is back — your family as witnesses' : 'History hidden');
}
$('#tNow').onclick = () => { stopPlay(); $('#chronicle').replaceChildren(); setTime(NOW); };

/* ---------------------------------------------------------
   Side panel
   --------------------------------------------------------- */
function chips(title, list) {
  if (!list.length) return '';
  return `<div class="rel-group"><h3>${title}</h3><div class="chips">
    ${list.map(p => `<button class="chip g-${p.gender}" data-goto="${p.id}">${esc(p.name)}</button>`).join('')}
  </div></div>`;
}

function renderPanel() {
  const panel = $('#panel');
  const p = selectedId && person(selectedId);
  panel.classList.toggle('open', !!p);
  document.body.classList.toggle('panel-open', !!p);
  if (!p) return;
  const age = ageText(p);
  const parents = p.parents.map(person);
  const spouses = p.spouses.map(person);
  const children = childrenOf(p.id);
  const siblings = siblingsOf(p.id);
  const grand = [...new Set(children.flatMap(c => childrenOf(c.id)))];

  panel.innerHTML = `
    <button class="icon-btn close" data-act="close" aria-label="Close">✕</button>
    <div class="p-head g-${p.gender}">
      <div class="p-avatar">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc(initials(p.name))}</div>
      <h2>${esc(p.name)}</h2>
      ${lifespan(p) || age ? `<p class="p-years">${esc(lifespan(p))}${lifespan(p) && age ? ' · ' : ''}${esc(age)}</p>` : ''}
      ${p.place ? `<p class="p-place">📍 ${esc(p.place)}</p>` : ''}
    </div>
    ${p.bio ? `<p class="p-bio">“${esc(p.bio)}”</p>` : ''}
    <div class="p-actions">
      <button class="btn primary wide" data-act="edit">✏️ Edit details</button>
      <button class="btn" data-act="parent" ${p.parents.length >= 2 ? 'disabled title="Already has two parents"' : ''}>+ Parent</button>
      <button class="btn" data-act="spouse">+ Partner</button>
      <button class="btn" data-act="child">+ Child</button>
      <button class="btn" data-act="sibling" ${p.parents.length ? '' : 'disabled title="Add a parent first"'}>+ Sibling</button>
      <button class="btn ghost danger wide" data-act="delete">Remove from tree</button>
    </div>
    ${chips('Parents', parents)}
    ${chips(spouses.length > 1 ? 'Partners' : 'Partner', spouses)}
    ${chips('Siblings', siblings)}
    ${chips('Children', children)}
    ${chips('Grandchildren', grand)}
    ${witnessedList(p)}
    <p class="hint">${{
      river: '✨ Their bloodline glows along the river. Press ▶ to watch the family flow through time.',
      orbit: '◎ Everyone is placed by how many steps they are from this person. Click anyone to put them at the centre.',
      tree: '✨ Their whole bloodline is lit up on the tree.'
    }[mode]} Double-click anyone to edit.</p>`;
}

/* the moments in history this person lived through */
function witnessedList(p) {
  const y = yrs[p.id];
  if (!y) return '';
  const regs = personRegions(p);
  const seen = HISTORY_EVENTS.filter(e => e.y >= y.b && e.y <= y.end && historyMatters(e, regs));
  if (!seen.length) return '';
  return `<div class="rel-group"><h3>Witnessed history · ${seen.length}</h3><ol class="witnessed">
    ${seen.map(e => `<li><button data-year="${e.y}" title="Travel to ${e.y}">
      <span class="w-yr">${e.y}</span><span class="w-ic">${e.i}</span>
      <span class="w-t">${esc(e.t)}</span><span class="w-age">${e.y === y.b ? 'born' : `age ${y.est ? '~' : ''}${e.y - y.b}`}</span>
    </button></li>`).join('')}</ol></div>`;
}

$('#panel').addEventListener('click', e => {
  const go = e.target.closest('[data-goto]');
  if (go) { select(go.dataset.goto, true); return; }
  const yr = e.target.closest('[data-year]');
  if (yr) { jumpToHistory(+yr.dataset.year); return; }
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!act) return;
  if (act === 'close') return select(null);
  if (act === 'edit') return openPersonDialog({ mode: 'edit', id: selectedId });
  if (act === 'delete') return removePerson(selectedId);
  openPersonDialog({ mode: 'new', rel: act, of: selectedId });
});

function select(id, center = false) {
  selectedId = id && person(id) ? id : null;
  // in orbit view, choosing someone makes them the new sun
  if (mode === 'orbit' && selectedId && selectedId !== orbitCenter) {
    orbitCenter = selectedId;
    render();
    fit();
    return;
  }
  updateHighlight();
  updateSky();
  renderStats();
  renderPanel();
  if (center && selectedId) centerOn(selectedId);
}

function removePerson(id) {
  const p = person(id);
  if (!p || !confirm(`Remove ${p.name} from the tree?`)) return;
  delete state.people[id];
  all().forEach(o => {
    o.parents = o.parents.filter(q => q !== id);
    o.spouses = o.spouses.filter(q => q !== id);
  });
  selectedId = null;
  if (orbitCenter === id) orbitCenter = null;
  save(); render();
  toast(`${p.name} removed`);
}

/* ---------------------------------------------------------
   Add / edit dialog
   --------------------------------------------------------- */
let dialogCtx = null;
let pendingPhoto;        // undefined = unchanged, '' = removed, dataURL = new
const form = $('#personForm');
const dlg = $('#personDialog');

function setPhotoPreview(src) {
  $('#photoPreview').innerHTML = src ? `<img src="${esc(src)}" alt="">` : '<span>📷</span>';
  $('#photoRemove').hidden = !src;
}

function openPersonDialog(ctx) {
  dialogCtx = ctx;
  form.reset();
  pendingPhoto = undefined;
  const p = ctx.mode === 'edit' ? person(ctx.id) : null;
  const t = ctx.of ? person(ctx.of) : null;
  const f = form.elements;

  const titles = {
    parent: `Add a parent of ${t?.name}`,
    spouse: `Add a partner for ${t?.name}`,
    child: `Add a child of ${t?.name}`,
    sibling: `Add a sibling of ${t?.name}`
  };
  $('#dlgTitle').textContent = p ? `Edit ${p.name}` : (titles[ctx.rel] || (all().length ? 'Add a person' : 'Add yourself'));

  f.fullName.value = p?.name || '';
  f.birth.value = p?.birth || '';
  f.death.value = p?.death || '';
  f.place.value = p?.place || '';
  f.bio.value = p?.bio || '';

  // smart default gender for partners / second parents
  let g = p?.gender || 'o';
  const opposite = x => (x === 'm' ? 'f' : x === 'f' ? 'm' : 'o');
  if (!p && ctx.rel === 'spouse') g = opposite(t.gender);
  if (!p && ctx.rel === 'parent' && t.parents.length === 1) g = opposite(person(t.parents[0]).gender);
  form.querySelector(`input[name=gender][value=${g}]`).checked = true;

  setPhotoPreview(p?.photo || '');

  const row = $('#otherParentRow');
  if (ctx.rel === 'child') {
    const sp = t.spouses.map(person);
    f.otherParent.innerHTML = sp.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('') +
      '<option value="">Unknown / not in the tree</option>';
    row.hidden = false;
  } else row.hidden = true;

  dlg.showModal();
  setTimeout(() => f.fullName.focus(), 50);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const f = form.elements;
  const data = {
    name: f.fullName.value.trim() || 'Unnamed',
    gender: form.querySelector('input[name=gender]:checked')?.value || 'o',
    birth: f.birth.value.trim(),
    death: f.death.value.trim(),
    place: f.place.value.trim(),
    bio: f.bio.value.trim()
  };

  if (dialogCtx.mode === 'edit') {
    const p = person(dialogCtx.id);
    Object.assign(p, data);
    if (pendingPhoto !== undefined) p.photo = pendingPhoto;
    toast('Saved ✓');
  } else {
    const id = uid();
    const np = { id, ...data, photo: pendingPhoto || '', parents: [], spouses: [] };
    state.people[id] = np;
    const t = dialogCtx.of && person(dialogCtx.of);
    switch (dialogCtx.rel) {
      case 'parent': {
        const other = t.parents[0];
        // full siblings (same parents) get the new parent too
        const sibs = t.parents.length
          ? all().filter(o => o.id !== t.id && o.id !== id && o.parents.length === t.parents.length &&
              o.parents.every(q => t.parents.includes(q)))
          : [];
        [t, ...sibs].forEach(c => c.parents.push(id));
        if (other && !person(other).spouses.length) {
          np.spouses.push(other); person(other).spouses.push(id);
        }
        if (sibs.length) toast(`Also linked as parent of ${sibs.length} sibling${sibs.length > 1 ? 's' : ''}`);
        break;
      }
      case 'spouse':
        np.spouses.push(t.id); t.spouses.push(id);
        break;
      case 'child': {
        np.parents.push(t.id);
        const op = f.otherParent.value;
        if (op) np.parents.push(op);
        break;
      }
      case 'sibling':
        np.parents = [...t.parents];
        break;
    }
    selectedId = id;
  }
  save();
  dlg.close();
  render();
  if (selectedId) centerOn(selectedId);
});

$('#photoInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    pendingPhoto = await resizeImage(file);
    setPhotoPreview(pendingPhoto);
  } catch { toast('Could not read that image'); }
});
$('#photoRemove').addEventListener('click', () => { pendingPhoto = ''; setPhotoPreview(''); });

/* Crop to a square and shrink so localStorage doesn't fill up */
function resizeImage(file, size = 180) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const m = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = r.result;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* Close dialogs via ✕ / Cancel / backdrop click */
document.querySelectorAll('dialog').forEach(d => {
  d.addEventListener('click', e => {
    if (e.target === d || e.target.closest('[data-close]')) d.close();
  });
});

/* ---------------------------------------------------------
   Relationship finder
   --------------------------------------------------------- */
function ancestorsOf(id) {
  const m = new Map([[id, 0]]);
  const q = [id];
  while (q.length) {
    const c = q.shift();
    const d = m.get(c);
    person(c).parents.forEach(p => { if (!m.has(p)) { m.set(p, d + 1); q.push(p); } });
  }
  return m;
}

function bloodLink(a, b) {
  const A = ancestorsOf(a), B = ancestorsOf(b);
  let best = null;
  A.forEach((da, id) => {
    if (!B.has(id)) return;
    const db = B.get(id);
    if (!best || da + db < best.da + best.db) best = { da, db };
  });
  return best;
}

/* What is someone at distance (da up, db down) to A — gendered by `g` */
function kinTerm(da, db, g) {
  const pick = (m, f, o) => (g === 'm' ? m : g === 'f' ? f : o);
  const greats = n => (n > 0 ? 'great-'.repeat(n) : '');
  if (da === 0) return db === 1 ? pick('son', 'daughter', 'child') : greats(db - 2) + 'grand' + pick('son', 'daughter', 'child');
  if (db === 0) return da === 1 ? pick('father', 'mother', 'parent') : greats(da - 2) + 'grand' + pick('father', 'mother', 'parent');
  if (da === 1 && db === 1) return pick('brother', 'sister', 'sibling');
  if (da === 1) return (db === 2 ? '' : greats(db - 3) + 'grand-') + pick('nephew', 'niece', 'niece/nephew');
  if (db === 1) return (da === 2 ? '' : greats(da - 3) + 'grand-') + pick('uncle', 'aunt', 'aunt/uncle');
  const deg = Math.min(da, db) - 1, rem = Math.abs(da - db);
  const ord = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][deg] || `${deg}th`;
  const removed = rem === 0 ? '' : rem === 1 ? ' once removed' : rem === 2 ? ' twice removed' : ` ${rem}× removed`;
  return `${ord} cousin${removed}`;
}

function relationship(a, b) {
  const A = person(a), B = person(b), g = B.gender;
  const pick = (m, f, o) => (g === 'm' ? m : g === 'f' ? f : o);
  if (a === b) return null;
  if (A.spouses.includes(b)) return pick('husband', 'wife', 'partner');

  const blood = bloodLink(a, b);
  if (blood) {
    let t = kinTerm(blood.da, blood.db, g);
    if (blood.da === 1 && blood.db === 1) {
      const shared = A.parents.filter(q => B.parents.includes(q)).length;
      if (shared === 1 && (A.parents.length > 1 || B.parents.length > 1)) t = 'half-' + t;
    }
    return t;
  }
  if (A.parents.some(p => person(p).spouses.includes(b))) return 'step' + pick('father', 'mother', 'parent');
  if (B.parents.some(p => A.spouses.includes(p))) return 'step' + pick('son', 'daughter', 'child');
  for (const s of A.spouses) {
    const r = bloodLink(s, b);
    if (r && r.da + r.db <= 2) return kinTerm(r.da, r.db, g) + '-in-law';
  }
  for (const s of B.spouses) {
    const r = bloodLink(a, s);
    if (r && r.da + r.db <= 2) return kinTerm(r.da, r.db, g) + '-in-law';
  }
  // any path at all?
  const seen = new Set([a]), q = [a];
  while (q.length) {
    const c = q.shift();
    const p = person(c);
    [...p.parents, ...p.spouses, ...childrenOf(c).map(x => x.id)].forEach(n => {
      if (!seen.has(n)) { seen.add(n); q.push(n); }
    });
  }
  return seen.has(b) ? 'family by marriage' : '';
}

function updateRelate() {
  const a = $('#relA').value, b = $('#relB').value;
  const out = $('#relResult');
  if (!a || !b) { out.textContent = 'Add at least two people first.'; return; }
  if (a === b) { out.innerHTML = 'That’s the same person 🙂'; return; }
  const r = relationship(a, b);
  const A = esc(person(a).name), B = esc(person(b).name);
  out.innerHTML = r
    ? `<div><b>${B}</b> is <b>${A}</b>’s<em>${esc(r)}</em></div>`
    : `<div><b>${A}</b> and <b>${B}</b> aren’t connected in the tree yet 🌱</div>`;
}

function openRelate() {
  const ps = all().sort((x, y) => x.name.localeCompare(y.name));
  const opts = ps.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  $('#relA').innerHTML = opts;
  $('#relB').innerHTML = opts;
  if (selectedId) $('#relA').value = selectedId;
  const other = ps.find(p => p.id !== $('#relA').value);
  if (other) $('#relB').value = other.id;
  updateRelate();
  $('#relateDialog').showModal();
}
$('#relA').addEventListener('change', updateRelate);
$('#relB').addEventListener('change', updateRelate);
$('#relSwap').addEventListener('click', () => {
  const a = $('#relA').value;
  $('#relA').value = $('#relB').value;
  $('#relB').value = a;
  updateRelate();
});

/* ---------------------------------------------------------
   Pan & zoom
   --------------------------------------------------------- */
const svg = $('#tree');
const vp = $('#viewport');
let anim = null;

function applyView() {
  vp.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);
}

function zoomAt(cx, cy, factor) {
  const r = svg.getBoundingClientRect();
  const px = cx - r.left, py = cy - r.top;
  const k2 = clamp(view.k * factor, 0.15, 2.5);
  const f = k2 / view.k;
  view.x = px - (px - view.x) * f;
  view.y = py - (py - view.y) * f;
  view.k = k2;
  applyView();
}

function animateTo(target, ms = 450) {
  cancelAnimationFrame(anim);
  const from = { ...view };
  const t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  const step = now => {
    const t = Math.min(1, (now - t0) / ms), e = ease(t);
    view.x = from.x + (target.x - from.x) * e;
    view.y = from.y + (target.y - from.y) * e;
    view.k = from.k + (target.k - from.k) * e;
    applyView();
    if (t < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

function fit(animate = true) {
  const ids = Object.keys(pos);
  if (!ids.length) { view.x = innerWidth / 2; view.y = innerHeight / 2; view.k = 1; applyView(); return; }
  const xs = ids.map(id => pos[id].x), ys = ids.map(id => pos[id].y);
  let minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  if (mode === 'river') {
    minX = yx(Y0) - 20; maxX = yx(NOW) + 50;
    minY = (riverBounds?.top ?? minY) - (histOn ? 190 : 50); maxY += 50;
  } else if (mode === 'orbit') {
    minX -= R + 80; maxX += R + 80; minY -= R + 30; maxY += R + 60;
  } else {
    minX -= 90; maxX += 90; minY -= 40; maxY += 70;
  }
  const aw = innerWidth - 40, ah = innerHeight - TOP_UI - BOTTOM_UI - 20;
  let k = clamp(Math.min(aw / (maxX - minX), ah / (maxY - minY)), 0.15, 1.1);
  // the river reads left to right: keep it legible and let tall families scroll
  if (mode === 'river') k = clamp(Math.min(aw / (maxX - minX), Math.max(ah / (maxY - minY), 0.82)), 0.15, 1.1);
  const tall = (maxY - minY) * k > ah;
  const target = {
    k,
    x: innerWidth / 2 - ((minX + maxX) / 2) * k,
    y: tall ? TOP_UI + 10 - minY * k : TOP_UI + 10 + ah / 2 - ((minY + maxY) / 2) * k
  };
  if (animate) animateTo(target); else { Object.assign(view, target); applyView(); }
}

function centerOn(id) {
  const p = pos[id];
  if (!p) return;
  const k = Math.max(view.k, 0.8);
  const panelW = innerWidth > 760 && selectedId ? 360 : 0;
  const offsetY = innerWidth <= 760 && selectedId ? innerHeight * 0.25 : 0;
  animateTo({
    k,
    x: (innerWidth - panelW) / 2 - p.x * k,
    y: TOP_UI + (innerHeight - TOP_UI - BOTTOM_UI) / 2 - offsetY - p.y * k
  });
}

const pointers = new Map();
let dragDist = 0, lastPinch = null;

svg.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  cancelAnimationFrame(anim);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) dragDist = 0;
  lastPinch = null;
});

window.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  const cur = { x: e.clientX, y: e.clientY };
  pointers.set(e.pointerId, cur);
  if (pointers.size === 1) {
    view.x += cur.x - prev.x;
    view.y += cur.y - prev.y;
    dragDist += Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
    if (dragDist > 4) svg.classList.add('grabbing');
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (lastPinch) {
      view.x += mx - lastPinch.mx;
      view.y += my - lastPinch.my;
      zoomAt(mx, my, d / lastPinch.d);
    }
    lastPinch = { d, mx, my };
    dragDist = 99;
  }
  applyView();
});

const endPointer = e => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) lastPinch = null;
  if (!pointers.size) svg.classList.remove('grabbing');
};
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);

svg.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(anim);
  zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
}, { passive: false });

svg.addEventListener('click', e => {
  if (dragDist > 4) return;
  const h = e.target.closest('.hist');
  if (h) { jumpToHistory(+h.dataset.y); return; }
  const n = e.target.closest('.node');
  if (n) select(n.dataset.id);
  else select(null);
});
svg.addEventListener('dblclick', e => {
  const n = e.target.closest('.node');
  if (n) openPersonDialog({ mode: 'edit', id: n.dataset.id });
});
svg.addEventListener('keydown', e => {
  const n = e.target.closest?.('.node');
  if (n && e.key === 'Enter') select(n.dataset.id, true);
});

$('#zoomIn').onclick = () => zoomAt(innerWidth / 2, innerHeight / 2, 1.25);
$('#zoomOut').onclick = () => zoomAt(innerWidth / 2, innerHeight / 2, 0.8);
$('#zoomFit').onclick = () => fit();

/* ---------------------------------------------------------
   Search
   --------------------------------------------------------- */
const searchInput = $('#search');
const results = $('#searchResults');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { results.hidden = true; return; }
  const hits = all().filter(p => p.name.toLowerCase().includes(q) || p.place.toLowerCase().includes(q)).slice(0, 8);
  results.innerHTML = hits.length
    ? hits.map(p => `<li><button data-id="${p.id}"><span>${esc(p.name)}</span><small>${esc(lifespan(p))}</small></button></li>`).join('')
    : '<li><button disabled><span>No one found</span></button></li>';
  results.hidden = false;
});
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') results.querySelector('button[data-id]')?.click();
  if (e.key === 'Escape') { searchInput.value = ''; results.hidden = true; searchInput.blur(); }
});
results.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  select(b.dataset.id, true);
  searchInput.value = '';
  results.hidden = true;
});
document.addEventListener('click', e => {
  if (!e.target.closest('.search')) results.hidden = true;
  if (!e.target.closest('.menu')) $('#menuList').hidden = true;
});

/* ---------------------------------------------------------
   Top bar actions & menu
   --------------------------------------------------------- */
$('#btnAdd').onclick = () => openPersonDialog({ mode: 'new' });
$('#btnStart').onclick = () => openPersonDialog({ mode: 'new' });
$('#btnDemo').onclick = () => loadDemo();
$('#btnRelate').onclick = () => {
  if (all().length < 2) return toast('Add at least two people first');
  openRelate();
};
$('#btnMenu').onclick = () => { $('#menuList').hidden = !$('#menuList').hidden; };

function loadDemo() {
  state = demoFamily();
  selectedId = null;
  save(); render(); fit();
  toast('Demo family loaded ✨');
}

$('#menuList').addEventListener('click', e => {
  const act = e.target.closest('[data-menu]')?.dataset.menu;
  if (!act) return;
  $('#menuList').hidden = true;
  if (act === 'homeland') {
    const n = prompt('Where does your family come from? (city or country — this picks the history shown)', state.homeland || '');
    if (n === null) return;
    state.homeland = n.trim().slice(0, 60);
    save(); render();
    const found = regionsOf(state.homeland).size;
    toast(!state.homeland ? 'Homeland cleared' : found ? `🌍 Showing the history of ${state.homeland}` : 'Place not recognised — showing world history');
  }
  if (act === 'rename') {
    const n = prompt('Name your family tree:', state.name);
    if (n && n.trim()) { state.name = n.trim().slice(0, 50); save(); render(); }
  }
  if (act === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'family'}-tree.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Backup downloaded 💾');
  }
  if (act === 'import') $('#importFile').click();
  if (act === 'paper') { mergePaperTree(); render(); fit(); }
  if (act === 'demo') {
    if (all().length && !confirm('Replace your current tree with the demo family?')) return;
    loadDemo();
  }
  if (act === 'clear') {
    if (!confirm('Delete everyone? (Export a backup first if you want to keep it.)')) return;
    state = { name: 'My Family', people: {} };
    selectedId = null;
    save(); render(); fit(false);
  }
});

/* ---------------------------------------------------------
   Merging a transcribed tree (paper-tree.js) into yours.
   Nothing is deleted or overwritten: a name is matched to an
   existing person only under the same (matched) parent.
   --------------------------------------------------------- */
const nameKey = s => String(s || '').toLowerCase().replace(/\(\?\)|[?⊗]/g, '')
  .replace(/[’‘ʻʼ`]/g, "'").replace(/\s+/g, ' ').trim();

function paperNote(n) {
  return [
    `From the old paper tree${n.c ? ` (written ${n.c.replace(/\?$/, '')})` : ''}.`,
    /\(\?\)/.test(n.n) && '(?) Uncertain reading of the handwriting — check later.',
    n.x && '⊗ on the paper — probably died or had no descendants (not confirmed).',
    n.note
  ].filter(Boolean).join(' ');
}

function mergeTree(src) {
  const before = new Set(Object.keys(state.people));
  const sum = { added: 0, matched: 0, elsewhere: new Set() };
  // under a parent "Murod" also matches "Murod Amirov"; elsewhere only the full name does
  const same = (p, n, loose) => [nameKey(n.n), nameKey(n.c)].some(k => {
    const a = nameKey(p.name);
    return k && (a === k || (loose && a.split(' ')[0] === k));
  });
  try { localStorage.setItem(`${STORE_KEY}.before-${src.id}`, JSON.stringify(state)); } catch { /* ignore */ }

  const walk = (n, parentId) => {
    const pool = parentId ? childrenOf(parentId) : all().filter(p => before.has(p.id));
    const hits = pool.filter(p => same(p, n, !!parentId));
    let p = hits.length === 1 ? hits[0] : null;
    if (p) {
      sum.matched += before.has(p.id) ? 1 : 0;
      if (n.est && !p.birth && !p.estBirth) p.estBirth = n.est;   // fills a blank, overwrites nothing
    } else {
      const id = uid();
      p = state.people[id] = {
        id, name: n.n, gender: n.g || 'm', birth: '', death: '', place: '', bio: paperNote(n), photo: '',
        parents: parentId ? [parentId] : [], spouses: [], estBirth: n.est || ''
      };
      sum.added++;
      if (all().some(o => before.has(o.id) && same(o, n, false))) sum.elsewhere.add(n.n);
    }
    (n.k || []).forEach(c => walk(c, p.id));
  };
  src.roots.forEach(n => walk(n, null));

  // someone the paper doesn't show yet: leave a note, don't attach
  const look = src.lookFor;
  if (look) all().filter(p => before.has(p.id) && look.names.some(k => nameKey(p.name).split(' ')[0] === nameKey(k)))
    .forEach(p => { if (!p.bio.includes(look.note)) p.bio = (p.bio ? p.bio + '\n\n' : '') + look.note; });

  (state.merged ||= []).includes(src.id) || state.merged.push(src.id);
  save();
  return sum;
}

function mergePaperTree() {
  const s = mergeTree(PAPER_TREE);
  const dup = [...s.elsewhere];
  toast(`📜 Paper tree merged — ${s.added} added, ${s.matched} matched to people already here` +
    (dup.length ? ` · same name elsewhere, check: ${dup.join(', ')}` : ''), dup.length ? 9000 : 6000);
}

$('#importFile').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data.people) throw new Error('bad file');
    state = normalize(data);
    selectedId = null;
    save(); render(); fit();
    toast(`Imported ${all().length} people`);
  } catch { toast('That file doesn’t look like a Roots backup'); }
});

/* ---------------------------------------------------------
   Keyboard shortcuts
   --------------------------------------------------------- */
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea, select') || document.querySelector('dialog[open]')) return;
  if (e.key === '/') { e.preventDefault(); searchInput.focus(); }
  else if (e.key === 'Escape') select(null);
  else if (e.key === 'f' || e.key === 'F') fit();
  else if (e.key === 'n' || e.key === 'N') openPersonDialog({ mode: 'new' });
  else if (e.key === '+' || e.key === '=') zoomAt(innerWidth / 2, innerHeight / 2, 1.2);
  else if (e.key === '-') zoomAt(innerWidth / 2, innerHeight / 2, 0.83);
  else if (e.key === '1') setMode('river');
  else if (e.key === '2') setMode('orbit');
  else if (e.key === '3') setMode('tree');
  else if (e.key === 'h' || e.key === 'H') toggleHistory();
  else if (e.key === ' ') { e.preventDefault(); play(); }
  else if (e.key === 'ArrowLeft') { stopPlay(); setTime(T - 1); }
  else if (e.key === 'ArrowRight') { stopPlay(); setTime(T + 1); }
});

/* ---------------------------------------------------------
   Animated background (stars / fireflies / paper dust)
   --------------------------------------------------------- */
const sky = (() => {
  const c = $('#sky');
  const ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, parts = [], theme = 'cosmos', shooting = null, t = 0;

  function seed() {
    const n = theme === 'cosmos' ? 0 : theme === 'forest' ? 50 : 70;   // cosmos draws the real sky
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3, ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, z: Math.random()
    }));
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduce) draw();
  }
  const wrap = p => { p.x = (p.x + w) % w; p.y = (p.y + h) % h; };

  function draw() {
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    if (theme === 'cosmos') {
      // the real sky, nudged a little as the tree is panned
      realSky.draw(ctx, w, h, t, clamp(view.x * 0.02, -50, 50), clamp(view.y * 0.02, -40, 40), reduce);
    }

    for (const p of parts) {
      if (theme === 'forest') {
        p.x += p.vx + Math.sin(t + p.ph) * 0.25;
        p.y += p.vy + Math.cos(t * 0.7 + p.ph) * 0.25;
        wrap(p);
        ctx.globalAlpha = 0.1 + 0.9 * Math.max(0, Math.sin(t * p.sp * 0.6 + p.ph));
        ctx.shadowColor = '#d8ff7a'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#eaff9e';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 0.9, 0, 7); ctx.fill();
      } else {
        p.y += 0.08 + p.z * 0.12;
        p.x += Math.sin(t * 0.5 + p.ph) * 0.12;
        wrap(p);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#8a6d45';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.9, 0, 7); ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    if (theme === 'cosmos' && !reduce) {
      if (!shooting && Math.random() < 0.003) shooting = { x: w * (0.3 + Math.random() * 0.7), y: Math.random() * h * 0.4, l: 0 };
      if (shooting) {
        const s = shooting;
        const g = ctx.createLinearGradient(s.x, s.y, s.x + 90, s.y - 45);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 1 - s.l / 45;
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + 90, s.y - 45); ctx.stroke();
        s.x -= 10; s.y += 5; s.l++;
        if (s.l > 45) shooting = null;
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  }

  return {
    start() { resize(); addEventListener('resize', resize); draw(); },
    setTheme(th) { theme = th; seed(); if (reduce) draw(); },
    refresh() { if (reduce) draw(); }
  };
})();

/* ---------------------------------------------------------
   Themes + boot
   --------------------------------------------------------- */
function setTheme(th) {
  document.documentElement.dataset.theme = th;
  $('#themeSelect').value = th;
  try { localStorage.setItem(THEME_KEY, th); } catch { /* ignore */ }
  sky.setTheme(th);
  if (Object.keys(yrs).length) renderStats();
}
$('#themeSelect').addEventListener('change', e => setTheme(e.target.value));

let savedTheme = 'cosmos';
try { savedTheme = localStorage.getItem(THEME_KEY) || 'cosmos'; } catch { /* ignore */ }

sky.start();
setTheme(savedTheme);
// deep links: #orbit, #tree, #river/1985, #river/1960/play
const [hashMode, hashYear, hashPlay] = location.hash.slice(1).split('/');
if (['river', 'orbit', 'tree'].includes(hashMode)) mode = hashMode;
if (!['river', 'orbit', 'tree'].includes(mode)) mode = 'river';
$('#tHist').classList.toggle('on', histOn);
if (+hashYear) T = +hashYear;
// the old paper tree joins the saved tree once, on first load;
// with nothing saved yet (only the demo showing) it becomes the tree
const paperDue = typeof PAPER_TREE !== 'undefined' && !(savedState?.merged || []).includes(PAPER_TREE.id);
if (paperDue) {
  if (!savedState) state = { name: 'My Family', homeland: '', merged: [], people: {} };
  mergePaperTree();
}
// once: the paper's homeland picks the history shown (change it in ⋯ → Family homeland)
if (typeof PAPER_TREE !== 'undefined' && PAPER_TREE.homeland && state.merged?.includes(PAPER_TREE.id) &&
    !state.merged.includes(PAPER_TREE.id + '-homeland')) {
  if (!state.homeland) state.homeland = PAPER_TREE.homeland;
  state.merged.push(PAPER_TREE.id + '-homeland');
  save();
}
render();
fit(false);
addEventListener('resize', () => { if (!selectedId) fit(false); });
if (hashPlay === 'play') play();
else if (all().length > 1 && !paperDue) setTimeout(() => toast('▶ Press play to watch your family flow through time'), 900);
