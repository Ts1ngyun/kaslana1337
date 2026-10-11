# Kiana Kaslana

A non-commercial, fan-made static website dedicated to **Kiana Kaslana** from *Honkai Impact 3rd*. A little universe of moonlight, encouragement, and a browser-local pixel adventure.

🌐 Live site: [kianakaslana.cn](https://kianakaslana.cn)

## Features

- A soft lavender design, keeping the original Kiana image and using fan-selected quotations.
- Gentle image zoom on hover, star animations, a daily encouragement button, and greetings based on the visitor's local clock.
- Responsive layouts for phones, tablets, and PCs, with touch and keyboard support.
- **Music from Kiana**: a cover-free lavender player for Da Capo, 飞鸟说, Moon Halo, and Starfall. Stream from NetEase's public audio endpoint, pause/resume, skip tracks, seek, or adjust volume. The volume slider works across tracks; browsers that reserve volume for hardware controls show a device-volume hint. No music files are stored in this repository; playback starts only after a click. Each track also links to its NetEase page.
- **FlyMe2theMoon**: an endless runner featuring a detailed local chibi Kiana sprite atlas based on supplied character references, with white cat ears, lavender hair tails, and four running frames. Jump over moon crystals and collect stars (+25 points). Each new run randomly chooses a joyful closed-eye smile, violet-eye smile, or funny cat face; pause/resume preserves it.
- Pause/resume, restart, gradual difficulty, and automatic pause when switching tabs, leaving the game, or resizing the screen.
- A personal best stored only in the current browser's `localStorage`. If storage is unavailable, the game keeps a session-only record. No accounts, online leaderboard, analytics, or network requests from the game.
- Keyboard focus indicators, screen-reader status announcements, reduced-motion support for decorative animations, and a small Rolling back the year link at the bottom to return to the top.

The encouragement messages and time-based greetings are fan-written; they are not official character dialogue. Greetings refresh every minute and when returning to the tab: early morning (00:00–04:59), morning (05:00–08:59), late morning (09:00–10:59), midday (11:00–13:59), afternoon (14:00–17:59), and evening (18:00–23:59).

## Run Locally

No installation or build is required. Clone/download the repository and open `index.html` in a browser. All images, styles, scripts, and game art are local; the page and game work offline. Music streaming, GitHub links, and the guestbook require an internet connection. The page does not request music until Play is clicked. Availability depends on NetEase and the visitor's region; a visible link to the selected song is always available.

For a local HTTP preview with Node.js:

```sh
npm run dev
```

Open **http://127.0.0.1:4177**. No `npm install` is needed. Use `PORT` to select a different port if necessary.

### Game Controls

| Action | PC | Phone / tablet |
| --- | --- | --- |
| Start / restart | Start button, or focus the game and press Space / ↑ / W | Start button or tap the game |
| Jump | Space / ↑ / W, click the game, or Jump button | Tap the game or Jump button |
| Pause / resume | Pause button, or P / Escape while the canvas has focus | Pause / Continue button |

Controls only capture keys when the game is focused, allowing normal page scrolling elsewhere. Scores increase with time and collected stars. Avoid the crystals; there is no double jump. A new record is saved when the run ends, pauses, or the page is closed. Records are separate per browser and site origin; clearing site data resets them. `file://` storage behavior varies by browser.

## Original v1

The original fan page is preserved in `v1/`, including its unchanged HTML, README, and character image from commit `e1d7572`. Open `v1/index.html` directly to view it. The existing `CNAME` remains at the repository root.

## Tech Stack

- HTML5 and Canvas 2D
- CSS3, responsive layouts, and `prefers-reduced-motion`
- Vanilla JavaScript, without runtime dependencies
- Node.js built-in test runner and optional local preview server
- GitHub Pages (existing `CNAME` preserved)

## Project Structure

```text
index.html              Page content and accessible game controls
css/style.css           Responsive styling and animations
js/site.js              Fan-written encouragement and local-time greetings
js/music.js             Online music player and four-track playlist
js/game-core.js         Game physics, collision detection, and scoring
js/game.js              Canvas scene, input, pause logic, and local records
js/character.js         Chibi expression selection and aligned sprite frames
images/                 Original image, moon favicon, and local runner atlas
scripts/serve.cjs       Optional local preview server
tests/                  Game regression tests
v1/                     Original page, README, and image
```

## Validation

With Node.js 18 or later:

```sh
npm test
```

Tests cover jumping/landing, collisions, pause/resume, star scoring, restarts, viewport changes, obstacle spacing, and large time deltas. For manual checks, try a narrow phone viewport, touch controls, switching tabs, disabled browser storage, and opening `index.html` offline.

## Disclaimer

This is a **non-commercial, fan-made website**. All characters, names, and related media belong to **miHoYo / HoYoverse**. The chibi sprite atlas is a fan-made illustration generated from supplied references and packaged locally; the browser loads it without external image requests. Music is streamed from the original platform, and all music rights remain with the respective artists and rights holders. This project is not affiliated with or endorsed by the official creators.

## 作者

Created and maintained by [Ts1ngyun](https://github.com/Ts1ngyun).
