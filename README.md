# Kiana's little universe

[简体中文](README.zh-CN.md) · **English**

A non-commercial fan website dedicated to **Kiana Kaslana** from *Honkai Impact 3rd*. Inspired by the moonlight, amethyst, and stars of **Herrscher of Finality**, and the opening atmosphere of the [Graduation Trip PV](https://www.bilibili.com/video/BV1Kj411g7Lu/), it takes a train journey into her little universe.

🌐 [Visit kianakaslana.cn](https://kianakaslana.cn)

## Features

- **Train opening**: the site's emblem appears, followed by a carriage and light transition into the page. Plays on the first visit in a browser tab; supports skipping, Escape, and replay.
- **Finality artwork**: character art, stars, orbital details, subtle mouse parallax, and scroll reveals, with layouts for phones, tablets, and PCs.
- **Graduation Trip memories**: retains the original Kiana image, quotations, and fan copy, with a link to the official PV.
- **Music from Kiana**: a purple player for Da Capo, 飞鸟说, Moon Halo, and Starfall. Supports play/pause, track switching, seeking, and volume, preserving volume across tracks. NetEase audio is requested only after Play; no music files are stored in the repository. Each song links to its original page.
- **FlyMe2theMoon**: a local chibi Kiana runner. Jump over moon crystals and collect stars for 25 points each. Each run randomly chooses one of three expressions, preserved through pause/resume.
- **Local records**: the personal best stays in the current browser, with no accounts or online leaderboard. Keyboard and touch controls are supported. The game pauses when switching tabs, leaving the game area, or resizing the screen.
- **Greetings and wishes**: welcomes the captain according to the visitor's local clock and includes a daily encouragement button. This copy is fan-written, not official character dialogue.
- **Motion and accessibility**: respects reduced-motion preferences, provides a footer motion switch, keyboard focus indicators and status announcements, and a **Rolling back the year** link to return to the top.

Some mobile browsers reserve volume for device buttons; the player shows a corresponding hint. Song availability depends on NetEase and the visitor's region.

## Run locally

No dependency installation or build is required. Clone or download the repository and open `index.html` in a browser.

The page artwork and game are local and work offline. Music, PV links, GitHub, and the guestbook require an internet connection. If browser storage is unavailable, records last only for the current session; clearing site data resets them.

For a local HTTP preview with Node.js:

```sh
npm run dev
```

Visit **http://127.0.0.1:4177**. No `npm install` is needed. Set `PORT` to use another port.

### Game controls

| Action | PC | Phone / tablet |
| --- | --- | --- |
| Start / restart | Start button, or focus the game and press Space / ↑ / W | Start button or tap the game |
| Jump | Space / ↑ / W, click the game, or Jump button | Tap the game or Jump button |
| Pause / resume | Pause button, or P / Escape while the canvas is focused | Pause / Continue button |

Game keys are captured only while the game is focused, allowing normal page scrolling elsewhere. There is no double jump. Records are separate per browser and site origin; `file://` storage behavior varies by browser.

## Version archives

- **`v2_final/`**: the complete site before the Finality redesign. All 21 source files were preserved byte-for-byte, including its images, player, game, README, and `v1/`. Open `v2_final/index.html` to view it independently.
- **`v1/`**: the original page, README, and image from commit `e1d7572`.

## Structure and technology

Built with HTML5, CSS3, vanilla JavaScript, and Canvas 2D, without runtime dependencies. Hosted on GitHub Pages.

```text
index.html                  Current page
css/finality.css            Finality theme, opening, and responsive styles
js/experience.js            Opening, parallax, reveals, and motion switch
js/site.js                  Local-time greetings and wishes
js/music.js                 Online music player
js/game-core.js              Runner physics, collisions, and scoring
js/game.js                   Scene, controls, and local records
js/character.js              Chibi expressions and animation
images/finality/             Finality art, PV cover, and train environment
images/                     Original images, runner atlas, and favicon
scripts/serve.cjs            Optional local preview server
tests/                      Game tests
v2_final/                   Complete V2 archive
v1/                         Original V1 archive
DESIGN-SOURCES.md            Asset sources and generation notes
```

Run game tests with Node.js 18 or later:

```sh
npm test
```

## Assets and disclaimer

This is a **non-commercial fan creation**. All characters, names, and official images belong to **miHoYo / HoYoverse**. Music rights remain with the respective artists and rights holders. The project is not affiliated with or endorsed by the official creators.

The train environment and chibi runner atlas were created using the built-in image generation tool and saved locally, with prompts alongside the assets. Sources for the Finality art and PV cover are listed in [DESIGN-SOURCES.md](DESIGN-SOURCES.md). Music streams from its original platform.

## Author

Created and maintained by [Ts1ngyun](https://github.com/Ts1ngyun), **with creative assistance from GPT6.1Astra**.
