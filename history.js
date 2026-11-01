'use strict';
/* =========================================================
   Roots — the history your family witnessed
   Only big, well-known moments. Each item lists the regions
   it matters to (r); 'world' shows for every family.
   An item is hidden when the family matches one of x.
   Era kinds (k) pick the backdrop colour.
   Add your own: { y, i, t, d, r: ['uz'] }
   ========================================================= */

const HISTORY_ERAS = [
  { y1: 1599, y2: 1747, k: 'khanate', p: 3, t: 'Bukhara under the Ashtarkhanids', d: 'The Khanate of Bukhara rules the heart of Mavarannahr.', r: ['central-asia'] },
  { y1: 1685, y2: 1815, k: 'enlight', p: 1, t: 'The Age of Enlightenment', d: 'Science, reason and new ideas about freedom spread.', r: ['world'] },
  { y1: 1709, y2: 1867, k: 'khanate', p: 3, t: 'The Three Khanates', d: 'Bukhara, Khiva and Kokand rule the lands between the rivers.', r: ['central-asia'] },
  { y1: 1760, y2: 1840, k: 'industry', p: 1, t: 'The Industrial Revolution', d: 'Steam power and factories transform Britain, then the world.', r: ['world'] },
  { y1: 1830, y2: 1895, k: 'cold', p: 2, t: 'The Great Game', d: 'Russia and Britain compete for Central Asia.', r: ['central-asia', 'af'] },
  { y1: 1867, y2: 1917, k: 'empire', p: 3, t: 'Russian Turkestan', d: 'The Silk Road cities under the rule of the Russian Empire.', r: ['central-asia'] },
  { y1: 1870, y2: 1914, k: 'industry', p: 1, t: 'The Industrial Age', d: 'Railways, telegraphs and factories change everyday life.', r: ['world'] },
  { y1: 1914, y2: 1918, k: 'war', p: 5, t: 'World War I', d: 'The Great War tears empires apart.', r: ['world'] },
  { y1: 1922, y2: 1991, k: 'soviet', p: 3, t: 'The Soviet Era', d: 'Life inside the USSR.', r: ['ussr'], x: ['uz'] },
  { y1: 1924, y2: 1991, k: 'soviet', p: 3, t: 'Soviet Uzbekistan', d: 'Uzbekistan as one of the republics of the USSR.', r: ['uz'] },
  { y1: 1929, y2: 1939, k: 'hard', p: 4, t: 'The Great Depression', d: 'A worldwide economic collapse.', r: ['world'] },
  { y1: 1939, y2: 1945, k: 'war', p: 5, t: 'World War II', d: 'The deadliest conflict in human history.', r: ['world'] },
  { y1: 1947, y2: 1991, k: 'cold', p: 2, t: 'The Cold War', d: 'Two superpowers, one divided world.', r: ['world'] },
  { y1: 1955, y2: 1975, k: 'war', p: 5, t: 'The Vietnam War', d: 'A long war that divided a generation.', r: ['us', 'vn'] },
  { y1: 1957, y2: 1972, k: 'space', p: 3, t: 'The Space Race', d: 'Humanity leaves the planet for the first time.', r: ['world'] },
  { y1: 1979, y2: 1989, k: 'war', p: 5, t: 'Soviet–Afghan War', d: 'A decade of war just across the border.', r: ['ussr', 'af'] },
  { y1: 1991, y2: 9999, k: 'free', p: 3, t: 'Independent Uzbekistan', d: 'A new nation on the ancient Silk Road.', r: ['uz'] },
  { y1: 1991, y2: 9999, k: 'free', p: 3, t: 'After the USSR', d: 'A new, independent country.', r: ['ussr'], x: ['uz'] },
  { y1: 1995, y2: 9999, k: 'digital', p: 2, t: 'The Digital Age', d: 'The internet connects the whole planet.', r: ['world'] },
  { y1: 2020, y2: 2022, k: 'hard', p: 4, t: 'The Pandemic Years', d: 'COVID-19 changes daily life everywhere.', r: ['world'] }
];

const HISTORY_EVENTS = [
  /* ── before 1900: khanates, the Great Game, the Russian conquest ── */
  { y: 1666, i: '🔥', t: 'The Great Fire of London', r: ['uk'] },
  { y: 1683, i: '⚔', t: 'The Ottomans are turned back at Vienna', r: ['europe', 'tr'] },
  { y: 1687, i: '🍎', t: "Newton publishes the laws of motion and gravity", r: ['world'] },
  { y: 1703, i: '🏛', t: 'Peter the Great founds St Petersburg', r: ['ussr'] },
  { y: 1709, i: '🏰', t: 'The Khanate of Kokand is founded in the Fergana Valley', r: ['uz', 'kg', 'tj'] },
  { y: 1717, i: '⚔', t: "Khiva destroys Russia's first expedition into Central Asia", r: ['uz', 'ru'] },
  { y: 1740, i: '⚔', t: 'Nader Shah of Persia conquers Bukhara and Khiva', r: ['central-asia'] },
  { y: 1747, i: '👑', t: 'The Manghit family takes power in Bukhara', r: ['uz'] },
  { y: 1776, i: '📜', t: 'American Declaration of Independence', r: ['world'] },
  { y: 1783, i: '🎈', t: 'First people fly — in a hot-air balloon', r: ['world'] },
  { y: 1785, i: '👑', t: 'Shah Murad becomes the first Emir of Bukhara', r: ['uz'] },
  { y: 1789, i: '🗽', t: 'The French Revolution', r: ['world'] },
  { y: 1796, i: '💉', t: 'The first vaccine — against smallpox', r: ['world'] },
  { y: 1812, i: '❄', t: "Napoleon's army is destroyed in the Russian winter", r: ['europe', 'ussr'] },
  { y: 1815, i: '⚔', t: 'Napoleon is defeated at Waterloo', r: ['europe'] },
  { y: 1816, i: '🌋', t: 'The Year Without a Summer, after the Tambora eruption', r: ['world'] },
  { y: 1825, i: '🚂', t: 'The first public steam railway opens', r: ['world'] },
  { y: 1839, i: '⚔', t: 'The First Anglo-Afghan War', r: ['af', 'central-asia'] },
  { y: 1842, i: '🕯', t: 'British officers Stoddart and Conolly executed in Bukhara', r: ['uz'] },
  { y: 1853, i: '⚔', t: 'The Crimean War', r: ['ussr', 'tr', 'europe'] },
  { y: 1859, i: '🐢', t: "Darwin publishes On the Origin of Species", r: ['world'] },
  { y: 1861, i: '⛓', t: 'Serfdom is abolished in Russia', r: ['ussr'] },
  { y: 1861, i: '⚔', t: 'The American Civil War begins', r: ['us'] },
  { y: 1865, i: '⚔', t: 'Russian troops capture Tashkent', r: ['uz'] },
  { y: 1868, i: '⚔', t: 'Russia takes Samarkand — Bukhara becomes a protectorate', r: ['uz'] },
  { y: 1869, i: '🚢', t: 'The Suez Canal opens', r: ['world'] },
  { y: 1873, i: '⚔', t: 'Russia conquers Khiva', r: ['uz'] },
  { y: 1876, i: '🏰', t: 'The Khanate of Kokand is abolished', r: ['uz'] },
  { y: 1876, i: '📞', t: 'The telephone is invented', r: ['world'] },
  { y: 1879, i: '💡', t: "Edison's electric light bulb", r: ['world'] },
  { y: 1888, i: '🚂', t: 'The Trans-Caspian Railway reaches Samarkand', r: ['uz'] },
  { y: 1898, i: '✊', t: 'The Andijan uprising', r: ['uz'] },

  /* ── 1900 onwards ── */
  { y: 1903, i: '✈', t: 'The Wright brothers fly the first aeroplane', r: ['world'] },
  { y: 1905, i: '🚩', t: 'The Russian Revolution of 1905', r: ['ussr'] },
  { y: 1906, i: '🚂', t: 'The Tashkent–Orenburg railway links Central Asia to Russia', r: ['central-asia'] },
  { y: 1910, i: '☄', t: "Halley's Comet blazes across the sky", r: ['world'] },
  { y: 1912, i: '🚢', t: 'The Titanic sinks', r: ['world'] },
  { y: 1914, i: '⚔', t: 'World War I begins', r: ['world'] },
  { y: 1916, i: '✊', t: 'Central Asian revolt against wartime labour conscription', r: ['central-asia'] },
  { y: 1917, i: '🚩', t: 'The Russian Revolution', r: ['ussr'] },
  { y: 1918, i: '🕊', t: 'World War I ends', r: ['world'] },
  { y: 1918, i: '🦠', t: 'Spanish flu pandemic', r: ['world'] },
  { y: 1920, i: '👑', t: 'The Emir of Bukhara and the Khan of Khiva are overthrown', r: ['uz'] },
  { y: 1923, i: '🏛', t: 'Republic of Turkey founded', r: ['tr'] },
  { y: 1924, i: '🏛', t: 'Uzbek SSR founded — Samarkand is its capital', r: ['uz'] },
  { y: 1927, i: '🧕', t: 'Hujum — the campaign to unveil women', r: ['uz'] },
  { y: 1928, i: '💊', t: 'Penicillin is discovered', r: ['world'] },
  { y: 1929, i: '📉', t: 'Wall Street Crash', r: ['world'] },
  { y: 1930, i: '🏛', t: 'Capital moves from Samarkand to Tashkent', r: ['uz'] },
  { y: 1937, i: '🕯', t: "Stalin's Great Terror", r: ['ussr'] },
  { y: 1938, i: '📖', t: "Writers Cho'lpon, Qodiriy and Fitrat are executed in the purges", r: ['uz'] },
  { y: 1939, i: '🌊', t: 'The Great Fergana Canal is dug by hand', r: ['uz'] },
  { y: 1939, i: '⚔', t: 'World War II begins', r: ['world'] },
  { y: 1941, i: '⚔', t: 'Germany invades the USSR', r: ['ussr'] },
  { y: 1941, i: '🚂', t: 'Uzbekistan shelters evacuees and war orphans', r: ['uz'] },
  { y: 1944, i: '🚂', t: 'Crimean Tatars and other peoples deported to Uzbekistan', r: ['uz'] },
  { y: 1945, i: '🕊', t: 'World War II ends', r: ['world'] },
  { y: 1945, i: '🌐', t: 'The United Nations is founded', r: ['world'] },
  { y: 1947, i: '🎆', t: 'India and Pakistan become independent', r: ['south-asia'] },
  { y: 1949, i: '🏮', t: "People's Republic of China founded", r: ['cn'] },
  { y: 1953, i: '🚩', t: 'Death of Stalin', r: ['ussr'] },
  { y: 1957, i: '🛰', t: 'Sputnik — the first satellite', r: ['world'] },
  { y: 1960, i: '🏜', t: 'The Aral Sea begins to shrink as its rivers water cotton', r: ['central-asia'] },
  { y: 1961, i: '🚀', t: 'Yuri Gagarin — first human in space', r: ['world'] },
  { y: 1962, i: '☢', t: 'The Cuban Missile Crisis', r: ['world'] },
  { y: 1963, i: '🕯', t: 'President Kennedy assassinated', r: ['us'] },
  { y: 1964, i: '✊', t: 'Civil Rights Act signed', r: ['us'] },
  { y: 1966, i: '🏚', t: 'The Tashkent earthquake — the city is rebuilt', r: ['uz'] },
  { y: 1969, i: '🌕', t: 'Humans walk on the Moon', r: ['world'] },
  { y: 1977, i: '🚇', t: 'Tashkent Metro opens — first in Central Asia', r: ['uz'] },
  { y: 1979, i: '⚔', t: 'Soviet–Afghan War begins', r: ['ussr', 'af'] },
  { y: 1980, i: '🏅', t: 'Moscow Olympics', r: ['ussr'] },
  { y: 1986, i: '☢', t: 'Chernobyl disaster', r: ['ussr', 'europe'] },
  { y: 1986, i: '☄', t: "Halley's Comet returns", r: ['world'] },
  { y: 1989, i: '🧱', t: 'The Berlin Wall falls', r: ['world'] },
  { y: 1990, i: '🤝', t: 'Germany reunifies', r: ['de'] },
  { y: 1991, i: '🌅', t: 'Uzbekistan becomes independent', r: ['uz'] },
  { y: 1991, i: '🌅', t: 'Independence from the USSR', r: ['ussr'], x: ['uz'] },
  { y: 1991, i: '🚩', t: 'The Soviet Union dissolves', r: ['ussr'] },
  { y: 1991, i: '🌐', t: 'The World Wide Web opens to everyone', r: ['world'] },
  { y: 1992, i: '📜', t: 'The Constitution of Uzbekistan is adopted', r: ['uz'] },
  { y: 1993, i: '🕌', t: 'Bukhara becomes a UNESCO World Heritage Site', r: ['bukhara'] },
  { y: 1994, i: '🕊', t: 'Apartheid ends in South Africa', r: ['za'] },
  { y: 1997, i: '☄', t: 'Comet Hale–Bopp, the great comet', r: ['world'] },
  { y: 1999, i: '💶', t: 'The euro is born', r: ['europe'] },
  { y: 2001, i: '🕯', t: 'September 11 attacks', r: ['world'] },
  { y: 2001, i: '🕌', t: 'Samarkand becomes a UNESCO World Heritage Site', r: ['samarkand'] },
  { y: 2004, i: '🌊', t: 'The Indian Ocean tsunami', r: ['world'] },
  { y: 2007, i: '📱', t: 'The smartphone era begins', r: ['world'] },
  { y: 2008, i: '📉', t: 'Global financial crisis', r: ['world'] },
  { y: 2016, i: '🗳', t: 'Brexit vote', r: ['uk'] },
  { y: 2016, i: '🏛', t: 'President Karimov dies; Shavkat Mirziyoyev succeeds him', r: ['uz'] },
  { y: 2020, i: '🦠', t: 'COVID-19 pandemic', r: ['world'] },
  { y: 2020, i: '☄', t: 'Comet NEOWISE glows in summer skies', r: ['world'] },
  { y: 2022, i: '🤖', t: 'AI chatbots go mainstream', r: ['world'] },
  { y: 2023, i: '📜', t: 'Uzbekistan adopts a new constitution by referendum', r: ['uz'] }
];

const ERA_COLORS = {
  war: '#ff5a3c', hard: '#c9a46b', soviet: '#e0403a', free: '#1fb6d9', cold: '#5b8fd6',
  space: '#7d6bff', digital: '#22d3b5', industry: '#b08a5a', empire: '#d4a14a',
  khanate: '#2bb39a', enlight: '#e8c66a'
};

/* Birthplace words → regions. Matched at the start of a word, any case. */
const REGION_WORDS = {
  samarkand: ['samarkand', 'samarqand', 'самарканд'],
  bukhara: ['bukhara', 'buxoro', 'бухара'],
  tashkent: ['tashkent', 'toshkent', 'ташкент'],
  uz: ['uzbek', "o'zbek", 'ozbek', 'узбек', 'khiva', 'xiva', 'fergana', "farg'ona", 'fargona', 'namangan',
    'andijan', 'andijon', 'nukus', 'karakalpak', 'qoraqalpog', 'qarshi', 'karshi', 'termez', 'termiz', 'navoi',
    'navoiy', 'jizzakh', 'jizzax', 'urgench', 'urganch', 'kokand', "qo'qon", 'qoqon', 'margilan', "marg'ilon",
    'shahrisabz', 'gulistan', 'guliston', 'chirchiq', 'angren', 'denov', 'kattakurgan', 'kattaqo'],
  kz: ['kazakh', 'qazaq', 'almaty', 'astana', 'shymkent'],
  kg: ['kyrgyz', 'bishkek', 'osh'],
  tj: ['tajik', 'dushanbe', 'khujand'],
  tm: ['turkmen', 'ashgabat'],
  af: ['afghan', 'kabul', 'mazar', 'herat'],
  ru: ['russia', 'россия', 'moscow', 'moskva', 'москва', 'petersburg', 'leningrad', 'kazan', 'novosibirsk', 'volgograd', 'stalingrad'],
  ua: ['ukrain', 'kyiv', 'kiev', 'kharkiv', 'odesa', 'odessa'],
  by: ['belarus', 'minsk'],
  az: ['azerbaijan', 'baku'],
  am: ['armenia', 'yerevan'],
  ge: ['tbilisi', 'sakartvelo'],
  tr: ['turkey', 'türkiye', 'turkiye', 'istanbul', 'ankara', 'izmir'],
  de: ['germany', 'deutschland', 'berlin', 'munich', 'hamburg'],
  uk: ['united kingdom', 'england', 'britain', 'london', 'scotland', 'manchester'],
  fr: ['france', 'paris'],
  europe: ['europe', 'italy', 'rome', 'spain', 'madrid', 'poland', 'warsaw', 'netherlands', 'amsterdam'],
  us: ['usa', 'u.s.', 'united states', 'america', 'new york', 'california', 'texas', 'chicago', 'los angeles', 'florida'],
  cn: ['china', 'beijing', 'shanghai'],
  'south-asia': ['india', 'delhi', 'mumbai', 'pakistan', 'karachi', 'lahore', 'bangladesh'],
  vn: ['vietnam', 'hanoi', 'saigon'],
  za: ['south africa', 'johannesburg', 'cape town']
};

const REGION_IMPLIES = {
  samarkand: ['uz'], bukhara: ['uz'], tashkent: ['uz'],
  uz: ['central-asia', 'ussr'], kz: ['central-asia', 'ussr'], kg: ['central-asia', 'ussr'],
  tj: ['central-asia', 'ussr'], tm: ['central-asia', 'ussr'],
  ru: ['ussr'], ua: ['ussr', 'europe'], by: ['ussr', 'europe'], az: ['ussr'], am: ['ussr'], ge: ['ussr'],
  de: ['europe'], uk: ['europe'], fr: ['europe']
};

const REGION_RX = Object.entries(REGION_WORDS).map(([r, words]) => [r,
  new RegExp('(^|[^a-z\\u0400-\\u04ff])(' + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')')]);

function regionsOf(text) {
  const s = String(text || '').toLowerCase();
  const out = new Set();
  if (!s.trim()) return out;
  REGION_RX.forEach(([r, rx]) => { if (rx.test(s)) out.add(r); });
  [...out].forEach(r => (REGION_IMPLIES[r] || []).forEach(x => {
    out.add(x);
    (REGION_IMPLIES[x] || []).forEach(z => out.add(z));
  }));
  return out;
}

const historyMatters = (item, regions) =>
  item.r.some(r => regions.has(r)) && !(item.x || []).some(r => regions.has(r));
