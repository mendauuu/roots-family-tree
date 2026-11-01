'use strict';
/* =========================================================
   Roots — the real night sky your family saw
   Bright stars and constellations projected for the
   birthplace's latitude, slowly turning around the pole.
   The time machine's year changes what was visible:
   city glow hides faint stars and the Milky Way, satellites
   appear from 1957, great comets show in their year.
   Star data: [name, RA hours, Dec degrees, magnitude, colour]
   ========================================================= */

const SKY_STARS = [
  ['Polaris', 2.530, 89.26, 2.0], ['Kochab', 14.845, 74.16, 2.1, '#ffd2a1'], ['Pherkad', 15.345, 71.83, 3.0],
  ['Yildun', 17.537, 86.59, 4.4], ['epsUMi', 16.766, 82.04, 4.2], ['zetUMi', 15.734, 77.79, 4.3], ['etaUMi', 16.292, 75.76, 5.0],
  ['Dubhe', 11.062, 61.75, 1.8, '#ffe0b0'], ['Merak', 11.031, 56.38, 2.4], ['Phecda', 11.897, 53.69, 2.4], ['Megrez', 12.257, 57.03, 3.3],
  ['Alioth', 12.900, 55.96, 1.8], ['Mizar', 13.399, 54.93, 2.2], ['Alkaid', 13.792, 49.31, 1.9],
  ['Caph', 0.153, 59.15, 2.3], ['Schedar', 0.675, 56.54, 2.2, '#ffd9a8'], ['gamCas', 0.945, 60.72, 2.4], ['Ruchbah', 1.430, 60.24, 2.7], ['Segin', 1.907, 63.67, 3.4],
  ['Betelgeuse', 5.919, 7.41, 0.5, '#ffa36b'], ['Rigel', 5.242, -8.20, 0.1, '#bcd4ff'], ['Bellatrix', 5.419, 6.35, 1.6, '#c8dcff'],
  ['Mintaka', 5.533, -0.30, 2.2], ['Alnilam', 5.604, -1.20, 1.7], ['Alnitak', 5.679, -1.94, 1.8], ['Saiph', 5.796, -9.67, 2.1], ['Meissa', 5.585, 9.93, 3.4],
  ['Sirius', 6.752, -16.72, -1.46, '#d6e6ff'], ['Adhara', 6.977, -28.97, 1.5], ['Wezen', 7.140, -26.39, 1.8], ['Mirzam', 6.378, -17.96, 2.0], ['Aludra', 7.402, -29.30, 2.4],
  ['Procyon', 7.655, 5.22, 0.34, '#fff4dc'],
  ['Aldebaran', 4.599, 16.51, 0.85, '#ffb070'], ['Elnath', 5.438, 28.61, 1.65], ['zetTau', 5.627, 21.14, 3.0], ['Ain', 4.477, 19.18, 3.5], ['gamTau', 4.330, 15.63, 3.6],
  ['Alcyone', 3.791, 24.11, 2.9, '#cfe0ff'], ['Atlas', 3.819, 24.05, 3.6], ['Electra', 3.747, 24.11, 3.7], ['Maia', 3.763, 24.37, 3.9], ['Merope', 3.772, 23.95, 4.1],
  ['Capella', 5.278, 46.00, 0.08, '#fff0c8'], ['Menkalinan', 5.992, 44.95, 1.9], ['thetAur', 5.995, 37.21, 2.6], ['iotAur', 4.950, 33.17, 2.7],
  ['Castor', 7.577, 31.89, 1.6], ['Pollux', 7.755, 28.03, 1.14, '#ffd29a'], ['Alhena', 6.629, 16.40, 1.9], ['Mebsuta', 6.732, 25.13, 3.0], ['Tejat', 6.383, 22.51, 2.9], ['Wasat', 7.335, 21.98, 3.5],
  ['Regulus', 10.140, 11.97, 1.4, '#d8e6ff'], ['etaLeo', 10.122, 16.76, 3.5], ['Algieba', 10.333, 19.84, 2.0], ['Adhafera', 10.278, 23.42, 3.4],
  ['Rasalas', 9.879, 26.01, 3.9], ['epsLeo', 9.764, 23.77, 3.0], ['Zosma', 11.235, 20.52, 2.6], ['Chertan', 11.237, 15.43, 3.3], ['Denebola', 11.818, 14.57, 2.1],
  ['Spica', 13.420, -11.16, 1.0, '#c4d8ff'], ['Arcturus', 14.261, 19.18, -0.05, '#ffbf80'], ['Izar', 14.750, 27.07, 2.4], ['Muphrid', 13.911, 18.40, 2.7],
  ['Seginus', 14.535, 38.31, 3.0], ['Nekkar', 15.032, 40.39, 3.5], ['delBoo', 15.258, 33.31, 3.5], ['Alphecca', 15.578, 26.71, 2.2],
  ['zetHer', 16.688, 31.60, 2.8], ['etaHer', 16.715, 38.92, 3.5], ['piHer', 17.251, 36.81, 3.2], ['epsHer', 17.005, 30.93, 3.9],
  ['Vega', 18.616, 38.78, 0.03, '#dbe8ff'], ['zetLyr', 18.746, 37.61, 4.3], ['Sheliak', 18.835, 33.36, 3.5], ['Sulafat', 18.982, 32.69, 3.3], ['delLyr', 18.908, 36.90, 4.3],
  ['Deneb', 20.690, 45.28, 1.25, '#eef3ff'], ['Sadr', 20.370, 40.26, 2.2], ['Gienah', 20.770, 33.97, 2.5], ['delCyg', 19.750, 45.13, 2.9], ['Albireo', 19.512, 27.96, 3.1, '#ffd38a'],
  ['Altair', 19.846, 8.87, 0.77, '#f4f6ff'], ['Tarazed', 19.771, 10.61, 2.7], ['Alshain', 19.922, 6.41, 3.7],
  ['Antares', 16.490, -26.43, 1.0, '#ff7a55'], ['Acrab', 16.091, -19.81, 2.6], ['Dschubba', 16.006, -22.62, 2.3], ['piSco', 15.981, -26.11, 2.9],
  ['tauSco', 16.598, -28.22, 2.8], ['epsSco', 16.836, -34.29, 2.3], ['muSco', 16.864, -38.05, 3.0], ['zetSco', 16.910, -42.36, 3.6],
  ['etaSco', 17.203, -43.24, 3.3], ['Sargas', 17.622, -42.99, 1.9], ['iotSco', 17.793, -40.13, 3.0], ['kapSco', 17.708, -39.03, 2.4], ['Shaula', 17.560, -37.10, 1.6],
  ['KausAus', 18.403, -34.38, 1.8], ['Nunki', 18.921, -26.30, 2.0], ['Ascella', 19.043, -29.88, 2.6], ['KausMed', 18.350, -29.83, 2.7],
  ['KausBor', 18.466, -25.42, 2.8], ['Alnasl', 18.097, -30.42, 3.0], ['phiSgr', 18.761, -26.99, 3.2], ['tauSgr', 19.116, -27.67, 3.3],
  ['Markab', 23.079, 15.21, 2.5], ['Scheat', 23.063, 28.08, 2.4, '#ffc08a'], ['Algenib', 0.220, 15.18, 2.8], ['Alpheratz', 0.140, 29.09, 2.1],
  ['Mirach', 1.162, 35.62, 2.1, '#ffc590'], ['Almach', 2.065, 42.33, 2.1], ['Mirfak', 3.405, 49.86, 1.8], ['Algol', 3.136, 40.96, 2.1],
  ['Fomalhaut', 22.961, -29.62, 1.16], ['Canopus', 6.399, -52.70, -0.74, '#fffbea'], ['Achernar', 1.629, -57.24, 0.46, '#cfe0ff'],
  ['AlphaCen', 14.660, -60.83, -0.27, '#fff0d0'], ['Hadar', 14.064, -60.37, 0.61, '#d0e0ff'],
  ['Acrux', 12.443, -63.10, 0.77, '#cfe0ff'], ['Mimosa', 12.795, -59.69, 1.25], ['Gacrux', 12.519, -57.11, 1.6, '#ffb38a'], ['delCru', 12.252, -58.75, 2.8]
];

/* constellation figures as chains of star names */
const SKY_LINES = [
  ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Dubhe'], ['Megrez', 'Alioth', 'Mizar', 'Alkaid'],
  ['Polaris', 'Yildun', 'epsUMi', 'zetUMi', 'Kochab', 'Pherkad', 'etaUMi', 'zetUMi'],
  ['Caph', 'Schedar', 'gamCas', 'Ruchbah', 'Segin'],
  ['Betelgeuse', 'Bellatrix'], ['Betelgeuse', 'Alnitak'], ['Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak', 'Saiph'],
  ['Mintaka', 'Rigel'], ['Betelgeuse', 'Meissa', 'Bellatrix'],
  ['Mirzam', 'Sirius', 'Adhara', 'Wezen', 'Aludra'], ['Sirius', 'Wezen'],
  ['Aldebaran', 'zetTau'], ['Aldebaran', 'gamTau', 'Ain', 'Elnath'],
  ['Alcyone', 'Atlas'], ['Alcyone', 'Electra'], ['Alcyone', 'Maia'], ['Alcyone', 'Merope'],
  ['Capella', 'Menkalinan', 'thetAur', 'Elnath', 'iotAur', 'Capella'],
  ['Castor', 'Pollux'], ['Castor', 'Mebsuta', 'Tejat'], ['Pollux', 'Wasat', 'Alhena'],
  ['Regulus', 'etaLeo', 'Algieba', 'Adhafera', 'Rasalas', 'epsLeo'], ['Algieba', 'Zosma', 'Denebola', 'Chertan', 'Regulus'], ['Zosma', 'Chertan'],
  ['Arcturus', 'Izar', 'delBoo', 'Nekkar', 'Seginus', 'Arcturus'], ['Arcturus', 'Muphrid'],
  ['zetHer', 'epsHer', 'piHer', 'etaHer', 'zetHer'],
  ['Vega', 'zetLyr', 'Sheliak', 'Sulafat', 'delLyr', 'zetLyr'],
  ['Deneb', 'Sadr', 'Albireo'], ['Gienah', 'Sadr', 'delCyg'],
  ['Tarazed', 'Altair', 'Alshain'],
  ['Acrab', 'Dschubba', 'piSco'], ['Dschubba', 'Antares', 'tauSco', 'epsSco', 'muSco', 'zetSco', 'etaSco', 'Sargas', 'iotSco', 'kapSco', 'Shaula'],
  ['Alnasl', 'KausMed', 'KausBor', 'phiSgr', 'KausMed'], ['Alnasl', 'KausAus', 'Ascella', 'phiSgr'], ['KausAus', 'KausMed'], ['phiSgr', 'Nunki', 'tauSgr', 'Ascella'],
  ['Markab', 'Scheat', 'Alpheratz', 'Algenib', 'Markab'], ['Alpheratz', 'Mirach', 'Almach'],
  ['Mirfak', 'Algol'], ['AlphaCen', 'Hadar'], ['Acrux', 'Gacrux'], ['Mimosa', 'delCru']
];

/* great comets, roughly where they hung in the sky that year */
const SKY_COMETS = [
  { y: 1910, ra: 6.0, dec: 12, len: 170, ang: -2.3 },     // Halley
  { y: 1965, ra: 12.0, dec: -12, len: 150, ang: -1.9 },   // Ikeya–Seki
  { y: 1976, ra: 22.0, dec: 6, len: 140, ang: -1.2 },     // West
  { y: 1986, ra: 18.5, dec: -40, len: 60, ang: -1.6 },    // Halley (faint)
  { y: 1996, ra: 13.6, dec: 56, len: 160, ang: -0.6 },    // Hyakutake
  { y: 1997, ra: 2.2, dec: 42, len: 150, ang: -2.6 },     // Hale–Bopp
  { y: 2007, ra: 21.0, dec: -45, len: 170, ang: -1.3 },   // McNaught
  { y: 2020, ra: 11.2, dec: 42, len: 110, ang: -2.0 }     // NEOWISE
];

/* latitude for the regions history.js recognises — most specific first */
const REGION_LAT = {
  samarkand: 39.65, bukhara: 39.77, tashkent: 41.3, uz: 41.0, kz: 43.2, kg: 42.9, tj: 38.6, tm: 37.9, af: 34.5,
  ru: 55.75, ua: 50.45, by: 53.9, az: 40.4, am: 40.2, ge: 41.7, tr: 41.0, de: 52.5, uk: 51.5, fr: 48.85,
  europe: 48.0, us: 40.7, cn: 39.9, 'south-asia': 28.6, vn: 21.0, za: -33.9
};

function latitudeOf(text) {
  const r = regionsOf(text);
  for (const k in REGION_LAT) if (r.has(k)) return REGION_LAT[k];
  return null;
}

const realSky = (() => {
  const D = Math.PI / 180;
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  let year = new Date().getFullYear(), lat = 41;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const star = (raH, dec, mag, col) => ({ ra: raH * 15 * D, sd: Math.sin(dec * D), cd: Math.cos(dec * D), mag, col, ph: rnd() * 6.28 });

  const named = {};
  const bright = SKY_STARS.map(([n, ra, dec, mag, col]) => (named[n] = star(ra, dec, mag, col || '#ffffff')));
  const fill = Array.from({ length: 1500 }, () => star(rnd() * 24, Math.asin(2 * rnd() - 1) / D, 6.5 - 3 * Math.pow(rnd(), 3)));
  const lines = SKY_LINES.flatMap(c => c.slice(1).map((n, i) => [named[c[i]], named[n]])).filter(([a, b]) => a && b);

  // the Milky Way: points scattered along the galactic plane, converted to RA/Dec
  const aG = 192.85948 * D, dG = 27.12825 * D, lN = 122.93192 * D;
  const milky = Array.from({ length: 2800 }, () => {
    let l = rnd() * 360;
    if (rnd() < 0.35) l = ((rnd() - 0.5) * 100 + 360) % 360;     // denser toward the galactic centre
    const b = (rnd() + rnd() + rnd() - 1.5) * 8 * D, L = l * D;
    const sd = Math.sin(b) * Math.sin(dG) + Math.cos(b) * Math.cos(dG) * Math.cos(lN - L);
    const ra = aG + Math.atan2(Math.cos(b) * Math.sin(lN - L), Math.sin(b) * Math.cos(dG) - Math.cos(b) * Math.sin(dG) * Math.cos(lN - L));
    return { ra, sd, cd: Math.sqrt(1 - sd * sd), s: 0.8 + rnd() * 2.2, a: 0.3 + rnd() * 0.7 };
  });

  let sl, cl, lst, cx, cy, Rh;
  // stereographic dome: zenith near the middle of the screen, north up, east on the left
  function proj(s, out) {
    const H = lst - s.ra, cH = Math.cos(H);
    const sinAlt = s.sd * sl + s.cd * cl * cH;
    if (sinAlt < -0.02) return false;
    const alt = Math.asin(sinAlt);
    const az = Math.atan2(-s.cd * Math.sin(H), s.sd * cl - s.cd * sl * cH);
    const r = Rh * Math.tan((Math.PI / 2 - alt) / 2);
    out.x = cx - r * Math.sin(az);
    out.y = cy - r * Math.cos(az);
    out.alt = alt;
    return true;
  }
  const haze = alt => clampN(alt / (14 * D), 0.12, 1);         // stars fade toward the horizon

  // naked-eye limit: dark skies early in the century, city glow later
  const limit = () => clampN(6.4 - Math.max(0, year - 1925) * 0.018, 4.5, 6.4);

  const sats = [];
  function satellites(ctx, w, h) {
    const want = year < 1957 ? 0 : year < 1975 ? 1 : year < 2000 ? 2 : year < 2019 ? 3 : 4;
    if (sats.length < want && Math.random() < 0.005) {
      const left = Math.random() < 0.5;
      sats.push({
        x: left ? -20 : w + 20, y: h * (0.1 + Math.random() * 0.6),
        vx: (left ? 1 : -1) * (0.3 + Math.random() * 0.3), vy: (Math.random() - 0.5) * 0.25,
        train: year >= 2019 && Math.random() < 0.35, iss: year >= 1998 && Math.random() < 0.3
      });
    }
    ctx.fillStyle = '#fff';
    for (let i = sats.length - 1; i >= 0; i--) {
      const s = sats[i];
      s.x += s.vx; s.y += s.vy;
      if (s.x < -200 || s.x > w + 200) { sats.splice(i, 1); continue; }
      const n = s.train ? 12 : 1;
      for (let k = 0; k < n; k++) {
        ctx.globalAlpha = s.iss ? 0.95 : 0.7;
        ctx.beginPath();
        ctx.arc(s.x - s.vx * k * 22, s.y - s.vy * k * 22, s.iss ? 2 : 1.2, 0, 7);
        ctx.fill();
      }
    }
  }

  function comet(ctx, c, p) {
    const tx = p.x + Math.cos(c.ang) * c.len, ty = p.y + Math.sin(c.ang) * c.len;
    const nx = -Math.sin(c.ang), ny = Math.cos(c.ang), spread = c.len * 0.12;
    const g = ctx.createLinearGradient(p.x, p.y, tx, ty);
    g.addColorStop(0, 'rgba(220,240,255,.75)');
    g.addColorStop(1, 'rgba(160,200,255,0)');
    ctx.globalAlpha = haze(p.alt);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(p.x + nx * 2, p.y + ny * 2);
    ctx.lineTo(tx + nx * spread, ty + ny * spread);
    ctx.lineTo(tx - nx * spread, ty - ny * spread);
    ctx.lineTo(p.x - nx * 2, p.y - ny * 2);
    ctx.fill();
    const head = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
    head.addColorStop(0, 'rgba(255,255,255,1)');
    head.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = head;
    ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 7); ctx.fill();
  }

  function draw(ctx, w, h, t, ox, oy, still) {
    cx = w / 2 + ox; cy = h * 0.45 + oy; Rh = Math.hypot(w, h) * 0.62;
    sl = Math.sin(lat * D); cl = Math.cos(lat * D);
    lst = (5 + t * 0.02) * 15 * D;              // the sky turns: a full day every 20 minutes
    const lim = limit(), mw = clampN((lim - 5.1) / 1.2, 0, 1);
    const p = {}, q = {};

    if (mw > 0) {
      ctx.fillStyle = '#c9d4ff';
      for (const m of milky) {
        if (!proj(m, p)) continue;
        ctx.globalAlpha = m.a * 0.2 * mw * haze(p.alt);
        ctx.beginPath(); ctx.arc(p.x, p.y, m.s, 0, 7); ctx.fill();
      }
    }

    ctx.fillStyle = '#fff';
    for (const s of fill) {
      if (s.mag > lim || !proj(s, p)) continue;
      const tw = still ? 1 : 0.7 + 0.3 * Math.sin(t * 1.7 + s.ph);
      ctx.globalAlpha = clampN((lim - s.mag) / 1.4 + 0.35, 0.3, 0.95) * haze(p.alt) * tw;
      ctx.beginPath(); ctx.arc(p.x, p.y, 0.6 + (6.5 - s.mag) * 0.32, 0, 7); ctx.fill();
    }

    ctx.strokeStyle = '#a8bcff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    for (const [a, b] of lines) {
      if (proj(a, p) && proj(b, q)) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
    }
    ctx.stroke();

    for (const s of bright) {
      if (s.mag > lim + 0.3 || !proj(s, p)) continue;
      const r = Math.max(0.8, 0.9 + (4.6 - s.mag) * 0.55), a = haze(p.alt);
      const tw = still ? 1 : 0.85 + 0.15 * Math.sin(t * 2.3 + s.ph);
      if (s.mag < 1.6) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
        g.addColorStop(0, s.col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.28 * a * tw;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 5, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = clampN(1.1 - s.mag * 0.15, 0.4, 1) * a * tw;
      ctx.fillStyle = s.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
    }

    SKY_COMETS.forEach(c => { if (c.y === year && proj(star(c.ra, c.dec, 0), p)) comet(ctx, c, p); });
    if (!still) satellites(ctx, w, h);

    // the warm glow of growing cities along the horizon
    const glow = (6.4 - lim) / 1.9;
    if (glow > 0.02) {
      const g = ctx.createLinearGradient(0, h, 0, h * 0.4);
      g.addColorStop(0, `rgba(255,165,90,${0.17 * glow})`);
      g.addColorStop(1, 'rgba(255,165,90,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalAlpha = 1;
  }

  return {
    draw,
    set(o) { year = o.year ?? year; lat = o.lat ?? lat; },
    milkyWayVisible: () => limit() > 5.3
  };
})();
