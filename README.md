# 🌌 Roots — Family River

A family history you can *watch*. Every life is a glowing river flowing through time; children branch out of their parents' rivers, couples braid together, and a time machine plays the whole story like a film. Plain HTML + CSS + JavaScript — no build step, no frameworks.

## Run it
1. Open this folder in VS Code.
2. Install the **Live Server** extension → right-click `index.html` → **Open with Live Server**.
   (Or just double-click `index.html` — it works from the file too.)

## Three ways to see your family
- **〰 River of Time** (default) — x is the year. Each person is a ribbon from birth to today (or fading out at death), with a bead showing their age.
- **◎ Orbit** — anyone can be the sun. Everyone else circles them on rings by how many steps away they are, labelled *father*, *first cousin*, *grandmother*… Click someone to make them the new centre.
- **⌥ Tree** — the classic top-down view, for when you need it.

## Time machine
- Drag the slider to any year: people not yet born vanish, lives that ended turn to ghosts, everyone shows their age *in that year*.
- Press **▶** (or Space) to play the family story. It lingers on years where something happened and narrates births, unions, new grandparents and passings.
- Shareable links: `#orbit`, `#tree`, `#river/1985`, `#river/1950/play`.

## Witnesses of history
Your ancestors become witnesses to the great moments of their time.
- **History is chosen by location**: birthplaces like *Samarkand*, *Tashkent*, *Bukhara*, *Moscow*, *Istanbul*, *London*, *New York*… pick the history shown (Uzbek, Soviet, European, American…), always with the big world moments. No birthplaces? Set one for the whole family in **⋯ → 🌍 Family homeland**.
- **Era colour**: the screen takes on a soft colour for the era the time machine is in (red for war years, blue-green after independence…).
- **In the river**: events stand above the timeline, eras run as coloured bars, and wars tint the years they lasted. Click any event to travel there.
- **Witness marks**: select someone and gold dots show every moment their life crossed. During playback everyone alive lights up as history passes.
- **Headlines**: playing the story pauses on each event, e.g. *"1961 — Yuri Gagarin, first human in space — witnessed by Karim (23), Zuhra (19)"*.
- **Witnessed history** list in each person's panel, with their age at each moment.
- Toggle with **🏛 History** or `H`. Add your own events in `history.js`.

## The real sky they saw (🌌 Cosmos theme)
The background is the actual night sky, not random dots.
- **Real stars and constellations**: about 140 bright stars (Big Dipper, Orion, Cassiopeia, Scorpius, the Southern Cross…) projected for the birthplace's latitude, slowly turning around the pole star.
- **Location**: the selected person's birthplace, or wherever most of the living family is. From Samarkand the Pole Star sits ~40° up; from South Africa the Southern Cross appears.
- **The year**: dark skies early in the century show the Milky Way and thousands of stars; as cities grow, the Milky Way fades (~1985) and a warm glow rises on the horizon. Satellites cross from 1957 (Sputnik), the ISS from 1998, Starlink trains from 2019.
- **Great comets** appear in their year: Halley 1910 and 1986, Ikeya–Seki 1965, West 1976, Hyakutake 1996, Hale–Bopp 1997, McNaught 2007, NEOWISE 2020.

## More features
- **Pan & zoom** — drag, mouse wheel, pinch on phone, `+` / `−` / `F` (fit).
- **Bloodline glow** — click a person and their ancestors + descendants light up with animated lines.
- **Add relatives in one click** — + Parent, + Partner, + Child, + Sibling from the side panel.
- **"How are we related?"** — pick two people and it tells you: *first cousin once removed*, *great-grandmother*, *brother-in-law*, *half-sister*, *stepfather*…
- **Photos** — auto-cropped to a circle and shrunk so they fit in browser storage.
- **3 themes** — 🌌 Cosmos (twinkling stars + shooting stars), 🌲 Forest (fireflies), 📜 Parchment (drifting dust).
- **Search** (`/`), **export / import backup** (.json), rename the tree.
- Data saves automatically in your browser (localStorage).

## Keyboard
| Key | Action |
|---|---|
| `/` | Search |
| `N` | Add person |
| `F` | Fit whole tree |
| `+` / `-` | Zoom |
| `Esc` | Deselect |
| `1` / `2` / `3` | River / Orbit / Tree |
| `Space` | Play / pause the story |
| `←` / `→` | One year back / forward |
| `H` | History on / off |

## Files
- `index.html` — page structure, dialogs
- `style.css` — themes (CSS variables at the top) and all styling
- `history.js` — world events, eras and birthplace → region matching
- `sky.js` — star catalogue, constellations, comets and the night-sky renderer
- `paper-tree.js` — the old handwritten family tree, transcribed. It merges once into a saved tree (names are matched under the same parent, nothing is deleted); run it again from ⋯ → **📜 Merge old paper tree**. The tree before the merge is kept in localStorage under `roots.family.v1.before-paper-1`.
- `app.js` — data, layouts, drawing, time machine, relationship finder, background animation

## Ideas to continue
- Export the tree as a PNG / PDF poster
- Timeline view (everyone on a line by birth year)
- Uzbek / Russian language toggle
- Sync to Firebase so the whole family can edit together
- "On this day" — birthdays and anniversaries
- Add a new theme: copy a `[data-theme]` block in `style.css` and add an `<option>` in `index.html`
