# Kiana Kaslana

A non-commercial, fan-made static website dedicated to **Kiana Kaslana** from *Honkai Impact 3rd*. A little universe of moonlight, encouragement, and a browser-local pixel adventure.

🌐 Live site: [kianakaslana.cn](https://kianakaslana.cn)

## Features

- A soft lavender design, keeping the original Kiana image and greeting.
- Gentle image zoom on hover, star animations, and a daily encouragement button.
- Responsive layouts for phones, tablets, and PCs, with touch and keyboard support.
- **Kiana's Moon Run**: an endless runner featuring an original code-drawn pixel Kiana with white twin braids and blue eyes. Jump over moon crystals and collect stars (+25 points).
- Pause/resume, restart, gradual difficulty, and automatic pause when switching tabs, leaving the game, or resizing the screen.
- A personal best stored only in the current browser's `localStorage`. If storage is unavailable, the game keeps a session-only record. No accounts, online leaderboard, analytics, or network requests from the game.
- Keyboard focus indicators, screen-reader status announcements, and reduced-motion support for decorative animations.

The encouragement messages are fan-written; they are not official character dialogue.

## Run Locally

No installation or build is required. Clone/download the repository and open `index.html` in a browser. All images, styles, scripts, and game art are local; the page and game work offline. GitHub links and the guestbook require an internet connection.

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
js/site.js              Fan-written encouragement messages
js/game-core.js         Game physics, collision detection, and scoring
js/game.js              Canvas art, input, pause logic, and local records
images/                 Original Kiana image and moon favicon
scripts/serve.cjs       Optional local preview server
tests/                 Game regression tests
```

## Validation

With Node.js 18 or later:

```sh
npm test
```

Tests cover jumping/landing, collisions, pause/resume, star scoring, restarts, viewport changes, obstacle spacing, and large time deltas. For manual checks, try a narrow phone viewport, touch controls, switching tabs, disabled browser storage, and opening `index.html` offline.

## Disclaimer

This is a **non-commercial, fan-made website**. All characters, names, and related media belong to **miHoYo / HoYoverse**. The pixel character is a fan-made interpretation drawn in code. This project is not affiliated with or endorsed by the official creators.

## 作者

Created and maintained by [Ts1ngyun](https://github.com/Ts1ngyun).
