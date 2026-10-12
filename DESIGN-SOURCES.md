# V3 design sources

This iteration was developed locally and published with the owner's authorization. The existing GitHub Pages configuration is retained.

- Opening reference: [Honkai Impact 3rd — Graduation Trip, official PV](https://www.bilibili.com/video/BV1Kj411g7Lu/). The opening uses a custom fan-site emblem and a new train environment, not the production studios' logos.
- `images/finality/graduation.webp`: official PV cover, retrieved from the public Bilibili video metadata. Source: https://i1.hdslb.com/bfs/archive/05133458ba400998f8b87532c46f781059c5c8d7.jpg
- `images/finality/kiana.webp`: Herrscher of Finality character render retrieved from [Marisa Impact's character page](https://marisaimpact.com/valk/hofi). Source: https://marisaimpact.com/images/valkfull/kiana_hofi.webp . Character artwork belongs to miHoYo / HoYoverse.
- `images/finality/portrait.webp` and `wallpaper.webp`: retained reference wallpapers from [the Herrscher of Finality wallpaper post](https://www.taptap.cn/moment/365449874247780737). Not required by the current page.
- `images/finality/train.webp`: newly generated environment illustration made using the built-in image generation tool. The generation prompt is saved in `images/finality/train.prompt.txt`.
- Original chibi image, runner atlas, music playlist, fan copy, greeting logic, and local game records are retained.

## Preservation

`v2_final/` contains all 21 source files from the previous website, copied byte-for-byte before this redesign. It includes the earlier `v1/` archive and runs independently via `v2_final/index.html`. The Git database and ignored temporary QA files are not part of the website archive.

## Local preview

Open `index.html` directly, or run `npm run dev` and visit the printed local URL. The opening runs on the first visit in a browser tab; use the header's replay button to see it again. Reduced motion skips the opening by default. The footer motion switch controls decorative effects.

New primary files: `css/finality.css`, `js/experience.js`. Existing `css/style.css` is retained as an original source but the new page uses `finality.css`.

README.zh-CN.md and README.md provide Chinese and English documentation, including the GPT6.1Astra creative assistance credit.