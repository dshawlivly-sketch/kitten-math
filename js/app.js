/* Kitten Math Village — game flow, characters, animation, and progress. */
(function () {
  'use strict';

  const { Questions, Sketchpad } = window.KM;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const sprite = (who, pose) => `assets/sprites/${who}/${pose}.webp`;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  /* ───────── Cast ───────── */
  const CAST = {
    hero: { name: 'Champ', color: '#3a6fcb' },
    axolotl: { name: 'Professor Axel', color: '#c23e68' },
    llama: { name: 'Ms. Lulu', color: '#26795a' },
    kitten: { name: 'Professor Mittens', color: '#7a5cc0' },
    coach: { name: 'Coach', color: '#3b6fd6' },
  };

  /* ───────── Levels ───────── */
  const LEVELS = [
    {
      id: 'multiples', host: 'axolotl', place: 'Pattern Pond', topic: 'Multiply by 10s, 100s & 1,000s',
      trophy: 'Pattern Pond Trophy',
      intro: [
        ['talk', `Hello, {name}! Welcome to Pattern Pond. Today we multiply <b>big</b> numbers using <b>little</b> facts!`],
        ['point', `Look at <b>4 × 300</b>. Hiding inside is a basic fact: <b>4 × 3 = 12</b>.`],
        ['read', `300 is 3 <b>hundreds</b>. So 4 × 3 hundreds = 12 hundreds… and 12 hundreds is <b>1,200</b>!`],
        ['think', `Watch out for sneaky zeros! In 5 × 400, the fact 5 × 4 = 2<b>0</b> already has a zero. So 5 × 400 = 20 hundreds = <b>2,000</b>.`],
        ['cheer', `Find the basic fact, then think tens, hundreds, or thousands. Let's dive in!`],
      ],
    },
    {
      id: 'estimate', host: 'llama', place: 'Meadow Market', topic: 'Estimate Products',
      trophy: 'Meadow Market Trophy',
      intro: [
        ['talk', `Hi, {name}! At my market we don't always need an exact answer. Sometimes “<b>about</b> how many” is enough.`],
        ['point', `We use <b>compatible numbers</b> — friendly numbers that are close to the real ones and easy to multiply.`],
        ['read', `For <b>48 × 21</b>: 48 is close to <b>50</b>, and 21 is close to <b>20</b>. And 50 × 20 = <b>1,000</b>. So 48 × 21 is about 1,000.`],
        ['think', `Estimates help you check your work, too. If someone says 48 × 21 = 10,080… that is way too big!`],
        ['cheer', `When you see the word “about,” think <b>estimate</b>. Ready to shop?`],
      ],
    },
    {
      id: 'distributive', host: 'kitten', place: 'Yarn Library', topic: 'Distributive Property',
      trophy: 'Yarn Library Trophy',
      intro: [
        ['talk', `Welcome to my library, {name}! Big multiplication is easier when you <b>break it apart</b>, like a ball of yarn.`],
        ['point', `The <b>Distributive Property</b> says you can break apart a factor, multiply each piece, and add.`],
        ['read', `For <b>5 × 7</b>: break 7 into 5 + 2. Then (5 × 5) + (5 × 2) = 25 + 10 = <b>35</b>.`],
        ['read', `It works for bigger numbers too! <b>6 × 14</b> = (6 × 10) + (6 × 4) = 60 + 24 = <b>84</b>.`],
        ['think', `One more: the <b>Associative Property</b> lets you regroup factors. 4 × 30 = 4 × (3 × 10) = (4 × 3) × 10 = <b>120</b>.`],
        ['cheer', `Break it apart, multiply the pieces, add them up. Let's go!`],
      ],
    },
    {
      id: 'partial', host: 'coach', place: "Coach's Clubhouse", topic: 'Partial Products & Area Models',
      trophy: 'Clubhouse Trophy',
      intro: [
        ['talk', `Hey, {name}! Time for the big play: multiplying <b>two 2-digit numbers</b>. We'll use an <b>area model</b>.`],
        ['explain', `For <b>23 × 45</b>, break both numbers into tens and ones: 23 = 20 + 3 and 45 = 40 + 5.`],
        ['point', `Draw a box with 4 parts. Each part is a <b>partial product</b>:<br>20 × 40 = 800 · 20 × 5 = 100<br>3 × 40 = 120 · 3 × 5 = 15`],
        ['read', `Then add all four: 800 + 100 + 120 + 15 = <b>1,035</b>. That's the product!`],
        ['cheer', `Use your sketchpad to draw the box and line up your adding. You've got this!`],
      ],
    },
    {
      id: 'champ', host: 'coach', place: 'Snowflake Stadium', topic: 'Championship Game · Unit 6 Review',
      trophy: 'Championship Trophy', trophySprite: 'hero',
      intro: [
        ['talk', `This is it, {name} — the Championship Game! It's a mix of everything from Unit 6, just like your test.`],
        ['explain', `Most of these are <b>word problems</b>. Read the whole story first. Ask yourself: what is it asking me to find?`],
        ['point', `Then pick your strategy: a basic fact with zeros, an estimate, breaking apart, or an area model.`],
        ['cheer', `Take your time, show your work on the sketchpad, and tap me if you get stuck. Play ball!`],
      ],
    },
  ];
  const levelById = (id) => LEVELS.find((l) => l.id === id);

  /* ───────── Saved progress ───────── */
  const STORE = 'kittenMathVillage.v1';
  let save = { name: '', sound: true, levels: {} };
  try { save = Object.assign(save, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* private mode */ }
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) { /* ignore */ } };
  const playerName = () => (save.name || '').trim() || 'Champ';

  /* ───────── Sound (tiny WebAudio blips, no files) ───────── */
  let actx = null;
  function tone(freq, start, dur, type, vol) {
    if (!save.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      const t = actx.currentTime + start;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol || 0.12, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (e) { /* audio unavailable */ }
  }
  const sfx = {
    tap: () => tone(660, 0, 0.07, 'triangle', 0.06),
    key: () => tone(520, 0, 0.05, 'triangle', 0.05),
    talk: () => [0, 0.07, 0.14, 0.21].forEach((t) => tone(pick([392, 440, 494, 523, 587]), t, 0.06, 'square', 0.025)),
    right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.11)),
    wrong: () => { tone(300, 0, 0.16, 'sine', 0.1); tone(240, 0.14, 0.22, 'sine', 0.1); },
    hint: () => { tone(587, 0, 0.1, 'triangle', 0.08); tone(784, 0.1, 0.16, 'triangle', 0.08); },
    fanfare: () => [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.12)),
  };
  function syncSound() { $$('.sound-btn').forEach((b) => { b.textContent = save.sound ? '🔊' : '🔇'; }); }

  /* ───────── Screens ───────── */
  function show(id) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    if (id === 'map') renderMap();
    if (id === 'shelf') renderShelf();
  }

  function setPose(img, who, pose) {
    img.dataset.who = who;
    img.dataset.pose = pose;
    img.src = sprite(who, pose);
  }

  function preload(who) {
    ['idle', 'talk', 'point', 'think', 'read', 'cheer', 'victory', 'oops', 'explain',
      'cele1', 'cele2', 'cele3', 'cele4', 'cele5', 'cele6'].forEach((p) => {
      if (p === 'explain' && who !== 'coach') return;
      new Image().src = sprite(who, p);
    });
  }

  /** Play the 6-frame celebration from the character sheet, then settle into a pose. */
  let celeToken = 0;
  async function celebrate(img, who, after) {
    const token = ++celeToken;
    const box = img.parentElement;
    const lift = [0, 4, 30, 42, 6, 0];
    for (let i = 0; i < 6; i++) {
      if (token !== celeToken) return;
      setPose(img, who, 'cele' + (i + 1));
      box.style.setProperty('--lift', lift[i] + 'px');
      await wait(i === 3 ? 260 : 150);
    }
    box.style.setProperty('--lift', '0px');
    await wait(700);
    if (token === celeToken && after) setPose(img, who, after);
  }

  /* ───────── Confetti ───────── */
  const confettiCanvas = $('#confetti');
  let confettiBits = [], confettiRunning = false;
  function confetti(count) {
    const c = confettiCanvas, w = (c.width = innerWidth), h = (c.height = innerHeight);
    const colors = ['#ffd24a', '#ff8fab', '#8fd0ff', '#b9a4e6', '#7fd6a4', '#ffffff'];
    for (let i = 0; i < (count || 90); i++) {
      confettiBits.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.5, y: h * 0.35,
        vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4,
        s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: pick(colors), life: 0,
      });
    }
    if (confettiRunning) return;
    confettiRunning = true;
    const ctx = c.getContext('2d');
    (function frame() {
      ctx.clearRect(0, 0, w, h);
      confettiBits = confettiBits.filter((b) => b.y < h + 30 && b.life < 260);
      confettiBits.forEach((b) => {
        b.vy += 0.32; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life++;
        ctx.save();
        ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.s / 2, -b.s / 3, b.s, b.s * 0.66);
        ctx.restore();
      });
      if (confettiBits.length) requestAnimationFrame(frame);
      else { confettiRunning = false; ctx.clearRect(0, 0, w, h); }
    })();
  }

  /* ───────── Stars ───────── */
  const starsHtml = (n) => [1, 2, 3].map((i) => `<span class="star${i <= n ? ' on' : ''}">★</span>`).join('');

  /* ───────── Title ───────── */
  const nameInput = $('#name-input');
  nameInput.value = save.name || '';
  $('#play-btn').addEventListener('click', () => {
    save.name = nameInput.value.trim();
    persist();
    nameInput.blur();
    sfx.right();
    show('map');
  });
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#play-btn').click(); });

  /* ───────── Map ───────── */
  function renderMap() {
    const earned = LEVELS.filter((l) => save.levels[l.id]).length;
    $('#trophy-count').textContent = `${earned}/${LEVELS.length}`;
    $('#map-greeting').innerHTML = earned === LEVELS.length
      ? `You collected every trophy, ${playerName()}! Keep practicing to earn 3 stars everywhere. ⭐`
      : `Hi, ${playerName()}! Visit each friend to practice for your Unit 6 test and collect their trophy.`;
    $('#stops').innerHTML = LEVELS.map((l, i) => {
      const done = save.levels[l.id];
      const who = l.trophySprite || l.host;
      const face = l.id === 'champ' ? sprite('hero', 'victory') : sprite(l.host, 'idle');
      return `<button class="stop stop-${l.id}" data-level="${l.id}" style="--tag:${CAST[l.id === 'champ' ? 'hero' : l.host].color}">
        <span class="stop-num">${i + 1}</span>
        <img class="stop-host sprite-bob" style="animation-delay:${-i * 0.6}s" src="${face}" alt="">
        <span class="stop-info">
          <span class="stop-place">${l.place}</span>
          <span class="stop-topic">${l.topic}</span>
          <span class="stars">${starsHtml(done ? done.stars : 0)}</span>
        </span>
        <img class="stop-trophy${done ? '' : ' locked'}" src="${sprite(who, 'trophy_front')}" alt="${done ? 'Trophy earned' : 'Trophy not earned yet'}">
      </button>`;
    }).join('');
  }
  $('#stops').addEventListener('click', (e) => {
    const b = e.target.closest('.stop');
    if (!b) return;
    sfx.tap();
    startLesson(b.dataset.level);
  });

  /* ───────── Lesson intro ───────── */
  let lesson = null;
  function startLesson(id) {
    const level = levelById(id);
    lesson = { level, i: 0 };
    preload(level.host); preload('hero'); preload('coach');
    $('#lesson-title').textContent = `${level.place} · ${level.topic}`;
    const tag = $('#lesson-name');
    tag.textContent = CAST[level.host].name;
    tag.style.background = CAST[level.host].color;
    show('lesson');
    lessonStep();
  }
  function lessonStep() {
    const { level, i } = lesson;
    const [pose, text] = level.intro[i];
    setPose($('#lesson-img'), level.host, pose);
    $('#lesson-text').innerHTML = text.replace('{name}', playerName());
    $('#lesson-next').textContent = i === level.intro.length - 1 ? "Let's play! ▶" : 'Next ▶';
    const b = $('#lesson-bubble');
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    sfx.talk();
  }
  $('#lesson-next').addEventListener('click', () => {
    if (++lesson.i >= lesson.level.intro.length) startQuiz(lesson.level.id);
    else lessonStep();
  });
  $('#lesson-skip').addEventListener('click', () => { sfx.tap(); startQuiz(lesson.level.id); });

  /* ───────── Quiz ───────── */
  const pad = new Sketchpad($('#pad'));
  pad.onChange = () => $('#pad-empty').classList.toggle('hide', !pad.isEmpty);
  let quiz = null;

  const hostImg = $('#host-img'), heroImg = $('#hero-img');
  const answerArea = $('#answer-area'), keypad = $('#keypad');

  keypad.innerHTML = ['1', '2', '3', 'del', '4', '5', '6', '0', '7', '8', '9', 'ok']
    .map((k) => `<button class="key${k === 'ok' ? ' key-ok' : k === 'del' ? ' key-del' : ''}" data-key="${k}">${k === 'ok' ? 'Check' : k === 'del' ? '⌫' : k}</button>`)
    .join('');

  function startQuiz(id) {
    const level = levelById(id);
    quiz = {
      level, questions: Questions.build(id, playerName()),
      i: 0, firstTry: 0, total: 0, retried: false, locked: false,
    };
    quiz.total = quiz.questions.length;
    show('quiz');
    closeCoach();
    renderQuestion();
  }

  function renderProgress() {
    $('#progress').innerHTML = quiz.questions.map((q, i) =>
      `<i class="dot${i < quiz.i ? (q.result === 'first' ? ' first' : ' done') : i === quiz.i ? ' now' : ''}"></i>`).join('');
  }

  function renderQuestion() {
    const q = quiz.questions[quiz.i];
    Object.assign(quiz, { tries: 0, hintTier: 0, locked: false, value: '', field: 0 });
    renderProgress();
    closeCoach();
    $('#feedback').classList.remove('show');
    $('#toast').classList.remove('show');
    $('#hint-btn').classList.remove('nudge');

    const host = q.host;
    quiz.host = host;
    setPose(hostImg, host, 'talk');
    setPose(heroImg, 'hero', 'think');
    const tag = $('#host-name');
    tag.textContent = CAST[host].name;
    tag.style.background = CAST[host].color;
    $('#q-text').innerHTML = (q.word ? '<span class="chip">Word problem</span>' : '') + q.text;
    const bubble = $('#q-bubble');
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    sfx.talk();
    setTimeout(() => { if (quiz && quiz.questions[quiz.i] === q && !quiz.locked) setPose(hostImg, host, 'idle'); }, 1400);

    keypad.classList.toggle('off', q.kind === 'mc');
    if (q.kind === 'mc') {
      answerArea.innerHTML = `<div class="choices">${q.choices.map((c, i) =>
        `<button class="choice" data-i="${i}">${c}</button>`).join('')}</div>`;
    } else if (q.kind === 'area') {
      const at = Math.floor(q.a / 10) * 10, ao = q.a % 10, bt = Math.floor(q.b / 10) * 10, bo = q.b % 10;
      quiz.fields = ['', '', '', '', ''];
      quiz.fieldOk = [false, false, false, false, false];
      answerArea.innerHTML = `<div class="area">
        <div class="area-grid">
          <span class="ax corner">×</span><span class="ax top">${bt}</span><span class="ax top">${bo}</span>
          <span class="ax side">${at}</span><button class="cell c0" data-f="0"></button><button class="cell c1" data-f="1"></button>
          <span class="ax side">${ao}</span><button class="cell c2" data-f="2"></button><button class="cell c3" data-f="3"></button>
        </div>
        <div class="area-total"><span>Add them up:<br><b>${q.a} × ${q.b} =</b></span><button class="cell total" data-f="4"></button></div>
      </div>`;
      selectField(0);
    } else {
      answerArea.innerHTML = `<div class="display" id="display"><span class="display-label">Your answer</span><span class="display-val" id="display-val"></span></div>`;
      renderValue();
    }
    pad.clear();
  }

  function renderValue() {
    const el = $('#display-val');
    if (el) el.textContent = quiz.value ? Questions.fmt(Number(quiz.value)) : '';
  }

  function selectField(f) {
    quiz.field = f;
    $$('.cell', answerArea).forEach((c) => c.classList.toggle('sel', Number(c.dataset.f) === f));
  }
  function renderFields() {
    $$('.cell', answerArea).forEach((c) => {
      const f = Number(c.dataset.f);
      c.textContent = quiz.fields[f] ? Questions.fmt(Number(quiz.fields[f])) : '';
      c.classList.toggle('ok', quiz.fieldOk[f]);
    });
  }

  keypad.addEventListener('click', (e) => {
    const b = e.target.closest('.key');
    if (!b || !quiz || quiz.locked) return;
    const k = b.dataset.key;
    const q = quiz.questions[quiz.i];
    if (k === 'ok') return check();
    sfx.key();
    if (q.kind === 'area') {
      const f = quiz.field;
      if (quiz.fieldOk[f]) return;
      if (k === 'del') quiz.fields[f] = quiz.fields[f].slice(0, -1);
      else if (quiz.fields[f].length < 6) quiz.fields[f] = (quiz.fields[f] + k).replace(/^0+(?=\d)/, '');
      $$('.cell', answerArea).forEach((c) => c.classList.remove('bad'));
      renderFields();
    } else {
      if (k === 'del') quiz.value = quiz.value.slice(0, -1);
      else if (quiz.value.length < 7) quiz.value = (quiz.value + k).replace(/^0+(?=\d)/, '');
      renderValue();
    }
  });

  answerArea.addEventListener('click', (e) => {
    if (!quiz || quiz.locked) return;
    const cell = e.target.closest('.cell');
    if (cell) { sfx.tap(); return selectField(Number(cell.dataset.f)); }
    const choice = e.target.closest('.choice');
    if (choice && !choice.disabled) {
      const q = quiz.questions[quiz.i];
      const i = Number(choice.dataset.i);
      if (i === q.answer) { choice.classList.add('right'); onRight(); }
      else { choice.classList.add('wrong'); choice.disabled = true; onWrong(); }
    }
  });

  function check() {
    const q = quiz.questions[quiz.i];
    if (q.kind === 'area') {
      if (quiz.fields.every((f) => f === '')) return toast('Tap a box and type a number first.');
      const want = q.cells.concat([q.answer]);
      let allOk = true, firstBad = -1;
      want.forEach((w, f) => {
        const ok = quiz.fields[f] !== '' && Number(quiz.fields[f]) === w;
        quiz.fieldOk[f] = ok;
        if (!ok) {
          allOk = false;
          if (firstBad < 0) firstBad = f;
          if (quiz.fields[f] !== '') $(`.cell[data-f="${f}"]`, answerArea).classList.add('bad');
        }
      });
      renderFields();
      if (allOk) return onRight();
      selectField(firstBad);
      const blanks = quiz.fields.some((f) => f === '');
      const anyBad = want.some((w, f) => quiz.fields[f] !== '' && !quiz.fieldOk[f]);
      if (!anyBad && blanks) { sfx.tap(); return toast('Nice so far! Fill in the rest of the boxes.'); }
      return onWrong();
    }
    if (quiz.value === '') return toast('Type your answer first.');
    if (Number(quiz.value) === q.answer) onRight();
    else {
      const d = $('#display');
      d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
      onWrong();
    }
  }

  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 6000);
  }

  const PRAISE = ['Home run!', 'You got it!', 'Fantastic!', 'Great thinking!', 'Nailed it!', 'Wonderful!', 'Super work!'];
  const TRY_AGAIN = [
    'Not quite — check your work and try again!',
    'Close! Look back at the problem and try once more.',
    'Hmm, not yet. Try writing it out on the sketchpad.',
  ];

  function onRight() {
    const q = quiz.questions[quiz.i];
    quiz.locked = true;
    q.result = quiz.tries === 0 ? 'first' : 'done';
    if (quiz.tries === 0 && !q.isRetry) quiz.firstTry++;
    closeCoach();
    $('#toast').classList.remove('show');
    $('#hint-btn').classList.remove('nudge');
    sfx.right();
    confetti(quiz.tries === 0 ? 70 : 35);
    celebrate(heroImg, 'hero', 'victory');
    setPose(hostImg, quiz.host, quiz.host === 'coach' ? 'cheer' : pick(['cheer', 'victory']));
    feedback('good', `🌟 ${pick(PRAISE)}`, q.explain);
  }

  function onWrong() {
    const q = quiz.questions[quiz.i];
    quiz.tries++;
    sfx.wrong();
    setPose(heroImg, 'hero', 'oops');
    setPose(hostImg, quiz.host, 'think');
    setTimeout(() => { if (quiz && !quiz.locked && quiz.questions[quiz.i] === q) setPose(heroImg, 'hero', 'think'); }, 1500);

    if (quiz.tries >= 3) {
      // Walk through it together, then come back to a fresh one like it later.
      quiz.locked = true;
      q.result = 'done';
      closeCoach();
      setPose(hostImg, quiz.host, quiz.host === 'coach' ? 'explain' : 'read');
      if (!q.isRetry && q.skill) {
        const again = Questions.retry(q.skill, playerName());
        again.isRetry = true;
        quiz.questions.push(again);
      }
      feedback('learn', `Let's look at this one together.`,
        `${q.explain}<br><span class="fb-note">That was a tricky one! You'll get another one like it at the end.</span>`);
      return;
    }
    toast(pick(TRY_AGAIN));
    if (quiz.tries === 2) setTimeout(() => { if (quiz && !quiz.locked && quiz.questions[quiz.i] === q) openCoach(); }, 700);
    else $('#hint-btn').classList.add('nudge');
  }

  function feedback(kind, head, text) {
    const f = $('#feedback');
    f.className = `feedback show ${kind}`;
    $('#fb-head').innerHTML = head;
    $('#fb-text').innerHTML = text;
    $('#fb-next').textContent = quiz.i === quiz.questions.length - 1 ? 'Finish ▶' : 'Next ▶';
  }

  $('#fb-next').addEventListener('click', () => {
    sfx.tap();
    celeToken++;
    $('.hero-box').style.setProperty('--lift', '0px');
    if (++quiz.i >= quiz.questions.length) finishQuiz();
    else renderQuestion();
  });

  $('#quiz-back').addEventListener('click', () => {
    sfx.tap();
    if (quiz && quiz.i > 0 && !confirm('Leave this round? Your progress in this round will be lost.')) return;
    quiz = null;
    show('map');
  });

  /* ───────── Coach hints (guide, never give the answer) ───────── */
  const coachEl = $('#coach');
  function openCoach() {
    const q = quiz.questions[quiz.i];
    if (quiz.locked) return;
    $('#hint-btn').classList.remove('nudge');
    const tier = Math.min(quiz.hintTier, q.hints.length - 1);
    quiz.hintTier = Math.min(quiz.hintTier + 1, q.hints.length);
    setPose($('#coach-img'), 'coach', ['talk', 'explain', 'point'][tier] || 'explain');
    $('#coach-text').innerHTML = `<span class="chip">Hint ${tier + 1} of ${q.hints.length}</span>${q.hints[tier]}`;
    const more = $('#coach-more');
    more.style.display = tier < q.hints.length - 1 ? '' : 'none';
    coachEl.classList.add('show');
    sfx.hint();
  }
  function closeCoach() { coachEl.classList.remove('show'); }
  $('#hint-btn').addEventListener('click', () => { if (quiz) openCoach(); });
  $('#coach-more').addEventListener('click', openCoach);
  $('#coach-ok').addEventListener('click', () => { sfx.tap(); closeCoach(); });

  /* ───────── Sketchpad tools ───────── */
  $$('.swatch').forEach((s) => s.addEventListener('click', () => {
    $$('.swatch').forEach((x) => x.classList.toggle('active', x === s));
    $('#pad-eraser').classList.remove('active');
    pad.setColor(s.dataset.color);
  }));
  $('#pad-eraser').addEventListener('click', () => {
    const on = !$('#pad-eraser').classList.contains('active');
    $('#pad-eraser').classList.toggle('active', on);
    pad.setEraser(on);
  });
  $('#pad-undo').addEventListener('click', () => pad.undo());
  $('#pad-clear').addEventListener('click', () => pad.clear());
  $('#pad-grid').classList.add('active');
  $('#pad-grid').addEventListener('click', () => {
    const on = $('#pad-paper').classList.toggle('grid');
    $('#pad-grid').classList.toggle('active', on);
  });
  $('#pad-expand').addEventListener('click', () => {
    const on = $('#quiz').classList.toggle('pad-big');
    $('#pad-expand').classList.toggle('active', on);
  });

  /* ───────── Result ───────── */
  let spinTimer = 0;
  function spin(img, who) {
    const views = ['front', 'right', 'back', 'left'];
    let i = 0;
    clearInterval(spinTimer);
    spinTimer = setInterval(() => {
      i = (i + 1) % 4;
      img.src = sprite(who, 'trophy_' + views[i]);
    }, 420);
  }

  function finishQuiz() {
    const { level, firstTry, total } = quiz;
    const stars = firstTry >= total - 1 ? 3 : firstTry >= Math.ceil(total * 0.6) ? 2 : 1;
    const prev = save.levels[level.id];
    const isNew = !prev;
    save.levels[level.id] = { stars: Math.max(stars, prev ? prev.stars : 0), best: Math.max(firstTry, prev ? prev.best || 0 : 0) };
    persist();

    const who = level.trophySprite || level.host;
    $('#result-title').textContent = isNew ? 'You earned a trophy!' : 'Round complete!';
    $('#result-trophy').src = sprite(who, 'trophy_front');
    $('#result-trophy-name').textContent = level.trophy;
    $('#result-stars').innerHTML = starsHtml(stars);
    $('#result-text').innerHTML =
      `You solved <b>${firstTry} of ${total}</b> on the first try, ${playerName()}. ` +
      (stars === 3 ? `Amazing — you are ready for this on the test!`
        : stars === 2 ? `Great work! Play again to go for 3 stars.`
          : `Good effort! Practice makes progress — try this one again soon.`);
    setPose($('#result-host'), level.host, level.host === 'coach' ? 'victory' : 'cheer');
    setPose($('#result-hero'), 'hero', 'victory');
    show('result');
    sfx.fanfare();
    confetti(160);
    setTimeout(() => confetti(120), 700);
    spin($('#result-trophy'), who);
    const loop = async () => {
      while ($('#result').classList.contains('active')) {
        await celebrate($('#result-hero'), 'hero', 'victory');
        await wait(900);
      }
    };
    loop();
    quiz.done = true;
  }
  $('#result-again').addEventListener('click', () => { clearInterval(spinTimer); celeToken++; startQuiz(quiz.level.id); });
  $('#result-map').addEventListener('click', () => { clearInterval(spinTimer); celeToken++; quiz = null; show('map'); });

  /* ───────── Trophy shelf ───────── */
  function renderShelf() {
    $('#shelf-grid').innerHTML = LEVELS.map((l) => {
      const done = save.levels[l.id];
      const who = l.trophySprite || l.host;
      return `<button class="trophy-card${done ? '' : ' locked'}" data-who="${who}" data-view="0">
        <img src="${sprite(who, 'trophy_front')}" alt="">
        <span class="plaque">${done ? l.trophy : '???'}</span>
        <span class="stars">${starsHtml(done ? done.stars : 0)}</span>
        <span class="trophy-how">${done ? l.topic : `Finish ${l.place} to earn it`}</span>
      </button>`;
    }).join('');
  }
  $('#shelf-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.trophy-card');
    if (!card || card.classList.contains('locked')) return;
    sfx.tap();
    const v = (Number(card.dataset.view) + 1) % 4;
    card.dataset.view = v;
    $('img', card).src = sprite(card.dataset.who, 'trophy_' + ['front', 'right', 'back', 'left'][v]);
  });
  $('#shelf-btn').addEventListener('click', () => { sfx.tap(); show('shelf'); });
  $('#reset-btn').addEventListener('click', () => {
    if (!confirm('Start over? This clears all trophies and stars.')) return;
    save.levels = {};
    persist();
    renderShelf();
  });

  /* ───────── Global wiring ───────── */
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => { sfx.tap(); show(b.dataset.go); }));
  $$('.sound-btn').forEach((b) => b.addEventListener('click', () => {
    save.sound = !save.sound;
    persist();
    syncSound();
    sfx.tap();
  }));
  syncSound();

  // iPad niceties: no pinch-zoom, no double-tap zoom, no rubber-band scrolling of the page
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch < 320 && !e.target.closest('input')) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // test hook
  window.KM.debug = { get quiz() { return quiz; }, save: () => save, show, startQuiz };
})();
