# Kitten Math Village

A cozy, village-style math practice game for iPad, built to review
**Reveal Math Unit 6 — Multiplication Strategies with Multi-Digit Numbers**.

It is a plain static site (no build step), so it runs on GitHub Pages as-is.

## What's in the game

| Stop | Host | Skill | Trophy |
| --- | --- | --- | --- |
| 1. Pattern Pond | Professor Axel (axolotl) | Multiply by multiples of 10, 100, 1,000 | Pattern Pond Trophy |
| 2. Meadow Market | Ms. Lulu (llama) | Estimate products with compatible numbers | Meadow Market Trophy |
| 3. Yarn Library | Professor Mittens (kitten) | Distributive (and Associative) Property | Yarn Library Trophy |
| 4. Coach's Clubhouse | Coach | Partial products and area models | Clubhouse Trophy |
| 5. Snowflake Stadium | everyone | Championship Game: mixed unit review, mostly word problems | Championship Trophy |

- **Word problems first.** Most questions in every round are word problems, and the
  Championship round is almost all word problems (including two-step stories).
- **Fresh numbers every time.** Questions are generated from templates, so a round can
  be replayed for more practice.
- **Sketchpad.** Scratch paper beside every question. Works with Apple Pencil
  (pressure-sensitive, palm rejection once the Pencil is used), with pen colors, eraser,
  undo, grid paper, and an expand button.
- **Ask Coach.** Three levels of hints per question. Hints guide the thinking and never
  give the answer. Coach also pops in automatically after two misses.
- **Mistakes are safe.** After three misses the host walks through the solution, and a
  new problem of the same kind is added to the end of the round.
- **Trophies and stars.** Finishing a stop earns its collectible statuette; stars
  (1–3) reflect how many were solved on the first try. Progress is saved on the device.

## Put it on GitHub Pages

1. On GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick the branch that holds these files (for example `main`) and the `/ (root)` folder, then **Save**.
4. After a minute the game is live at `https://<your-username>.github.io/kitten-math/`.

On the iPad, open that address in Safari, tap **Share → Add to Home Screen**, and it
opens full screen like an app (and keeps working offline after the first visit).

## Run it locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project layout

```
index.html              all screens (title, village map, lesson, quiz, result, trophy shelf)
css/style.css           look and layout (landscape first, portrait supported)
js/questions.js         question generators, hints, and worked solutions for each skill
js/sketchpad.js         Apple Pencil–friendly drawing canvas
js/app.js               game flow, characters, animation, sound, saved progress
assets/sprites/<who>/   character poses, faces, celebration frames, and trophies
assets/icons/           home-screen icons
art-source/             the original character reference sheets
tools/slice_sprites.py  cuts the reference sheets into transparent sprites
manifest.webmanifest, sw.js   home-screen app + offline support
```

## Customizing

- **Character names** — `CAST` at the top of `js/app.js`.
- **Lesson dialogue, stop names, trophy names** — `LEVELS` in `js/app.js`.
- **Questions and hints** — each generator in `js/questions.js` returns the story text,
  the answer, three hints, and a worked explanation. The list of questions in each
  round is in `builders` at the bottom of that file.
- **New art** — replace a sheet in `art-source/` (same layout) and run
  `python3 tools/slice_sprites.py` (needs `pillow`, `numpy`, `scipy`).
