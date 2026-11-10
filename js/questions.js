/* Question bank for Unit 6: Multiplication Strategies with Multi-Digit Numbers.
 *
 * Every question is generated fresh from a template, so each round has new numbers.
 * Question shape:
 *   { skill, host, word, kind: 'num' | 'mc' | 'area', text, answer, choices?, a?, b?, cells?,
 *     hints: [3 guiding hints that never give the answer], explain: worked solution }
 */
(function () {
  'use strict';

  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[R(0, arr.length - 1)];
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const B = (n) => `<b>${typeof n === 'number' ? fmt(n) : n}</b>`;
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = R(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const r10 = (n) => Math.round(n / 10) * 10;
  const r100 = (n) => Math.round(n / 100) * 100;
  const BOX = '<span class="blank">?</span>';

  /** two-digit number with tens in [tLo,tHi] and ones chosen from a list */
  const two = (tLo, tHi, ones) => R(tLo, tHi) * 10 + pick(ones);
  const unitWord = (z) => ({ 10: 'tens', 100: 'hundreds', 1000: 'thousands' }[z]);

  function mc(q, correct, wrongs) {
    const seen = new Set([String(correct)]);
    const opts = [correct];
    wrongs.forEach((w) => {
      if (!seen.has(String(w)) && opts.length < 4) {
        seen.add(String(w));
        opts.push(w);
      }
    });
    const choices = shuffle(opts);
    return Object.assign(q, { kind: 'mc', choices, answer: choices.indexOf(correct) });
  }

  /* ───────────────────────── Level 1: multiples of 10, 100, 1,000 ───────────────────────── */

  const M = { skill: 'multiples', host: 'axolotl' };

  function multBare() {
    const a = R(2, 9), b = R(2, 9), z = pick([10, 100, 1000]);
    return {
      ...M, word: false, kind: 'num', answer: a * b * z,
      text: `Use a basic fact and a pattern.<div class="eq">${a} × ${fmt(b * z)} = ${BOX}</div>`,
      hints: [
        `There is a basic fact hiding inside this problem. Cover up the zeros in ${B(b * z)} — what fact do you see?`,
        `${B(b * z)} is the same as ${b} ${unitWord(z)}. So you are finding ${a} groups of ${b} ${unitWord(z)}.`,
        `Work out ${a} × ${b} first. Your answer is that many <b>${unitWord(z)}</b> — write it as a regular number.` +
          ((a * b) % 10 === 0 ? ' Careful: the basic fact already ends in a zero, and that zero counts too!' : ''),
      ],
      explain: `${a} × ${b} = ${a * b}, so ${a} × ${b} ${unitWord(z)} = ${a * b} ${unitWord(z)} = ${B(a * b * z)}.`,
    };
  }

  function multPattern() {
    const a = R(2, 9), b = R(2, 9);
    return {
      ...M, word: false, kind: 'num', answer: a * b * 1000,
      text: `Finish the pattern.<div class="eq small">${a} × ${b} = ${a * b}<br>${a} × ${b}0 = ${fmt(a * b * 10)}<br>` +
        `${a} × ${b}00 = ${fmt(a * b * 100)}<br>${a} × ${b},000 = ${BOX}</div>`,
      hints: [
        `Look down the pattern. What stays the same in every answer, and what changes?`,
        `Each time the factor gets one more zero, it becomes 10 times as big. What happens to the product?`,
        `The last line is ${a} × ${b} <b>thousands</b>. How many thousands is that? Now write that number.`,
      ],
      explain: `${a} × ${b} = ${a * b}, so ${a} × ${b} thousands = ${a * b} thousands = ${B(a * b * 1000)}.`,
    };
  }

  function multMissing() {
    const a = R(2, 9), b = R(2, 9), z = pick([10, 100, 1000]);
    return {
      ...M, word: false, kind: 'num', answer: b * z,
      text: `Find the missing factor.<div class="eq">${a} × ${BOX} = ${fmt(a * b * z)}</div>`,
      hints: [
        `Start with the basic fact. ${a} times <i>what</i> gives the front part of ${B(a * b * z)}?`,
        `Think about ${a} × ? = ${a * b}. That gives you the first digit of the missing factor.`,
        `Now decide: is the missing factor that many tens, hundreds, or thousands? Check by multiplying it back by ${a}.`,
      ],
      explain: `${a} × ${b} = ${a * b}, and ${fmt(a * b * z)} is ${a * b} ${unitWord(z)}, so the missing factor is ${b} ${unitWord(z)} = ${B(b * z)}.`,
    };
  }

  function multWord(name) {
    const a = R(3, 9), b = R(2, 9), z = pick([10, 100, 100, 1000]);
    const big = b * z;
    const stories = {
      10: [
        `Each bucket at practice holds ${B(big)} softballs. Coach fills ${B(a)} buckets. How many softballs is that?`,
        `${name} does ${B(big)} jumping jacks every day for ${B(a)} days. How many jumping jacks does she do in all?`,
        `The snack stand sells ${B(big)} cups of hot cocoa at each game. There are ${B(a)} games. How many cups are sold in all?`,
      ],
      100: [
        `A box of trading cards has ${B(big)} cards. The team shop orders ${B(a)} boxes. How many cards is that?`,
        `Each section of Snowflake Stadium has ${B(big)} seats. There are ${B(a)} sections. How many seats are there in all?`,
        `${name} takes ${B(big)} steps running the bases at each practice. She has ${B(a)} practices this month. How many steps is that?`,
        `A bag of sunflower seeds has ${B(big)} seeds. The team shares ${B(a)} bags. How many seeds do they have?`,
      ],
      1000: [
        `The snow machine makes ${B(big)} snowflakes every minute. It runs for ${B(a)} minutes. How many snowflakes does it make?`,
        `A printer prints ${B(big)} game tickets every hour. It runs for ${B(a)} hours. How many tickets does it print?`,
        `Each truck brings ${B(big)} pounds of sand for the new field. ${B(a)} trucks come. How many pounds of sand is that?`,
      ],
    };
    return {
      ...M, word: true, kind: 'num', answer: a * big,
      text: pick(stories[z]),
      hints: [
        `Picture the story: there are ${a} equal groups, and every group has the same amount. Which operation puts equal groups together?`,
        `You need ${a} × ${fmt(big)}. That looks big — but can you spot a basic fact hiding inside ${fmt(big)}?`,
        `Find ${a} × ${b} first. Then remember ${fmt(big)} is ${b} <b>${unitWord(z)}</b>, so your answer is that many ${unitWord(z)}.`,
      ],
      explain: `${a} × ${fmt(big)} = ${a} × ${b} ${unitWord(z)} = ${a * b} ${unitWord(z)} = ${B(a * big)}.`,
    };
  }

  function multTensWord(name) {
    const a = R(2, 9), b = R(2, 9);
    const A = a * 10, Bn = b * 10;
    const story = pick([
      `The parking lot at the ballpark has ${B(A)} rows. Each row fits ${B(Bn)} cars. How many cars can park there?`,
      `${B(A)} teams come to the winter tournament. Each team brings ${B(Bn)} fans. How many fans come in all?`,
      `The team sells ${B(A)} boxes of popcorn. Each box has ${B(Bn)} pieces of popcorn. How many pieces is that?`,
      `${name}'s school has ${B(A)} shelves of library books. Each shelf holds ${B(Bn)} books. How many books is that?`,
    ]);
    return {
      ...M, word: true, kind: 'num', answer: A * Bn,
      text: story,
      hints: [
        `This is an equal-groups story. Which two numbers do you need to multiply?`,
        `Both numbers are multiples of ten: ${A} is ${a} tens and ${Bn} is ${b} tens. What basic fact can help?`,
        `Find ${a} × ${b}. Then think: tens × tens = <b>hundreds</b>. So your answer is that many hundreds.`,
      ],
      explain: `${a} tens × ${b} tens = ${a * b} hundreds = ${B(A * Bn)}.`,
    };
  }

  /* ───────────────────────── Level 2: estimating with compatible numbers ───────────────────────── */

  const E = { skill: 'estimate', host: 'llama' };
  const FAR = [1, 2, 3, 7, 8, 9];   // ones digits that round clearly
  const NEAR = [1, 2, 8, 9];        // ones digits that barely change the number

  function estWord(name) {
    const a = two(2, 8, FAR), b = two(2, 8, FAR);
    const ra = r10(a), rb = r10(b);
    const story = pick([
      `The bleachers have ${B(a)} rows with ${B(b)} seats in each row. <b>About</b> how many seats are there?`,
      `The snack stand has ${B(a)} boxes of granola bars. Each box has ${B(b)} bars. <b>About</b> how many granola bars is that?`,
      `${B(a)} buses drive fans to the big game. Each bus carries ${B(b)} fans. <b>About</b> how many fans ride a bus?`,
      `${name} has a sticker book with ${B(a)} pages. Each page has ${B(b)} stickers. <b>About</b> how many stickers does she have?`,
    ]);
    return {
      ...E, word: true, kind: 'num', answer: ra * rb,
      text: story + `<div class="note">Estimate: round each number to the nearest ten, then multiply.</div>`,
      hints: [
        `The word “about” tells you to <b>estimate</b>. You do not need the exact answer! Which two numbers get multiplied?`,
        `Compatible numbers are friendly numbers that are close to the real ones. Which ten is ${a} closest to? Which ten is ${b} closest to?`,
        `Multiply your two rounded numbers. Use the basic fact, then remember tens × tens = hundreds.`,
      ],
      explain: `${a} is close to ${ra}, and ${b} is close to ${rb}. ${ra} × ${rb} = ${B(ra * rb)}. So there are about ${fmt(ra * rb)}.`,
    };
  }

  function est3Word() {
    const a = R(3, 8);
    const n = R(2, 8) * 100 + pick([0, 1, 2, 3, 7, 8, 9]) * 10 + R(1, 9);
    const rn = r100(n);
    const story = pick([
      `A box holds ${B(n)} softball cards. The shop has ${B(a)} boxes. <b>About</b> how many cards is that?`,
      `Each game, ${B(n)} fans come to the stadium. There are ${B(a)} games. <b>About</b> how many fans come in all?`,
      `The bakery makes ${B(n)} cookies each day for ${B(a)} days. <b>About</b> how many cookies does it make?`,
    ]);
    return {
      ...E, word: true, kind: 'num', answer: a * rn,
      text: story + `<div class="note">Estimate: round ${fmt(n)} to the nearest hundred, then multiply.</div>`,
      hints: [
        `“About” means estimate. Which number in the story is hard to multiply in your head?`,
        `Find a compatible number for ${n}. Is it closer to ${Math.floor(n / 100) * 100} or ${Math.floor(n / 100) * 100 + 100}?`,
        `Now multiply ${a} by your rounded number. Use the basic fact, then think about how many hundreds you have.`,
      ],
      explain: `${n} is close to ${rn}. ${a} × ${rn} = ${a * rn / 100} hundreds = ${B(a * rn)}.`,
    };
  }

  function estBest() {
    const a = two(2, 8, FAR), b = two(2, 8, FAR);
    const ra = r10(a), rb = r10(b);
    const other = (n, r) => (r > n ? r - 10 : r + 10);
    return mc({
      ...E, word: false,
      text: `Which compatible numbers are the best choice for estimating<div class="eq">${a} × ${b}</div>`,
      hints: [
        `Compatible numbers should be <b>close</b> to the real numbers and <b>easy</b> to multiply.`,
        `Look at ${a}. Is it closer to ${Math.floor(a / 10) * 10} or ${Math.floor(a / 10) * 10 + 10}? Do the same for ${b}.`,
        `Cross out any choice where a number moved far away from ${a} or ${b}. Which choice is left?`,
      ],
      explain: `${a} is closest to ${ra} and ${b} is closest to ${rb}, so ${B(`${ra} × ${rb}`)} is the best estimate.`,
    }, `${ra} × ${rb}`, shuffle([`${other(a, ra)} × ${rb}`, `${ra} × ${other(b, rb)}`, `${ra / 10} × ${rb / 10}`, `${other(a, ra)} × ${other(b, rb)}`]));
  }

  function estReasonable() {
    const a = two(2, 8, NEAR), b = two(2, 8, NEAR);
    const est = r10(a) * r10(b), exact = a * b;
    const kind = pick(['ok', 'big', 'small']);
    const claim = kind === 'ok' ? exact : kind === 'big' ? exact * 10 : Math.round(exact / 10);
    const who = pick(['Mia', 'Leo', 'Ava', 'Kenji', 'Rosa']);
    const good = { ok: `Yes — it is close to the estimate`, big: `No — it is much too big`, small: `No — it is much too small` };
    return mc({
      ...E, word: true,
      text: `${who} multiplied ${B(a)} × ${B(b)} and got ${B(claim)}. Use an estimate to check. Is ${who}'s answer reasonable?`,
      hints: [
        `You don't need to multiply exactly. An estimate can tell you if an answer makes sense.`,
        `Round ${a} and ${b} to the nearest ten and multiply those compatible numbers. Write your estimate on the sketchpad.`,
        `Compare your estimate with ${fmt(claim)}. Are they close together, or is one way bigger than the other?`,
      ],
      explain: `Estimate: ${r10(a)} × ${r10(b)} = ${fmt(est)}. ${who}'s answer of ${fmt(claim)} is ` +
        (kind === 'ok' ? `close to that, so it <b>is reasonable</b>.` : kind === 'big' ? `about 10 times too big, so it is <b>not reasonable</b>.` : `about 10 times too small, so it is <b>not reasonable</b>.`),
    }, good[kind], Object.values(good));
  }

  function estEnough(name) {
    const a = two(3, 8, NEAR), b = two(3, 8, NEAR);
    const est = r10(a) * r10(b);
    const gap = Math.max(400, r100(est * 0.4));
    const enough = Math.random() < 0.5;
    const need = enough ? est - gap : est + gap;
    const item = pick(['cups', 'napkins', 'raffle tickets', 'stickers']);
    const yes = `Yes — the estimate is more than ${fmt(need)}`;
    const no = `No — the estimate is less than ${fmt(need)}`;
    return mc({
      ...E, word: true,
      text: `${name}'s team needs ${B(need)} ${item} for the tournament. They have ${B(a)} packs with ${B(b)} ${item} in each pack. Use an estimate. Do they have enough?`,
      hints: [
        `First figure out <b>about</b> how many ${item} the team has. Which two numbers tell you that?`,
        `Use compatible numbers: round ${a} and ${b} to the nearest ten and multiply.`,
        `Now compare your estimate with the ${fmt(need)} they need. Is your estimate greater or less?`,
      ],
      explain: `${r10(a)} × ${r10(b)} = ${fmt(est)}. They have about ${fmt(est)} ${item}, and they need ${fmt(need)}, so ` +
        (enough ? `<b>yes</b>, they have enough.` : `<b>no</b>, they do not have enough.`),
    }, enough ? yes : no, [yes, no, `You can't tell without the exact answer`]);
  }

  function estVocab() {
    return mc({
      ...E, word: false,
      text: `What are <b>compatible numbers</b>?`,
      hints: [
        `“Compatible” means things that work well together.`,
        `Think about how we estimated 48 × 21. Which numbers did we use instead, and why?`,
        `Look for the choice that talks about numbers that are <b>close</b> to the real ones and <b>easy</b> to compute with.`,
      ],
      explain: `Compatible numbers are numbers close to the real numbers that are easy to compute with mentally — like using 50 × 20 for 48 × 21.`,
    }, `Numbers close to the real numbers that are easy to multiply in your head`,
    [`The answers you get when you multiply`, `Numbers that are exactly the same as each other`, `Numbers that always end in 5`]);
  }

  /* ───────────────────────── Level 3: Distributive (and Associative) Property ───────────────────────── */

  const D = { skill: 'distributive', host: 'kitten' };

  function distBlank() {
    const a = R(3, 9), b = two(1, 6, [2, 3, 4, 5, 6, 7, 8, 9]);
    const t = Math.floor(b / 10) * 10, o = b % 10;
    const hideTens = Math.random() < 0.4;
    return {
      ...D, word: false, kind: 'num', answer: hideTens ? t : o,
      text: `Fill in the missing number.<div class="eq small">${a} × ${b} = (${a} × ${hideTens ? BOX : t}) + (${a} × ${hideTens ? o : BOX})</div>`,
      hints: [
        `The Distributive Property lets you break apart one factor into two smaller pieces.`,
        `Which factor was broken apart here — ${a} or ${b}? One of its pieces is already shown.`,
        `The two pieces have to add back up to ${b}. ${hideTens ? `? + ${o}` : `${t} + ?`} = ${b}.`,
      ],
      explain: `${b} = ${t} + ${o}, so ${a} × ${b} = (${a} × ${t}) + (${a} × ${o}). The missing number is ${B(hideTens ? t : o)}.`,
    };
  }

  function distExpr() {
    const a = R(3, 9), b = two(2, 6, [2, 3, 4, 6, 7, 8, 9]);
    const t = Math.floor(b / 10) * 10, o = b % 10;
    return mc({
      ...D, word: false,
      text: `Which shows a way to use the Distributive Property to find<div class="eq">${a} × ${b}</div>`,
      hints: [
        `Break apart ${b} into tens and ones first. What two numbers add up to ${b}?`,
        `The ${a} has to multiply <b>both</b> pieces — it gets “distributed” to each one.`,
        `After multiplying each piece by ${a}, do you add the two products or multiply them?`,
      ],
      explain: `${b} = ${t} + ${o}. Multiply each part by ${a} and add: ${B(`(${a} × ${t}) + (${a} × ${o})`)}.`,
    }, `(${a} × ${t}) + (${a} × ${o})`,
    [`(${a} × ${t}) + ${o}`, `(${a} × ${t / 10}) + (${a} × ${o})`, `(${a} + ${t}) × (${a} + ${o})`]);
  }

  function distWord(name) {
    const a = R(3, 9), b = two(1, 5, [2, 3, 4, 6, 7, 8, 9]);
    const t = Math.floor(b / 10) * 10, o = b % 10;
    const story = pick([
      `There are ${B(a)} teams in the Snowflake League. Each team has ${B(b)} players. How many players are in the league?`,
      `Professor Mittens has ${B(a)} shelves of math books. Each shelf holds ${B(b)} books. How many books is that?`,
      `The bake sale has ${B(a)} trays of cupcakes. Each tray has ${B(b)} cupcakes. How many cupcakes are there?`,
      `${name} throws ${B(b)} pitches at every practice. She has ${B(a)} practices. How many pitches does she throw in all?`,
      `A ticket to the game costs ${B('$' + b)}. ${name}'s family buys ${B(a)} tickets. How many dollars do they spend?`,
    ]);
    return {
      ...D, word: true, kind: 'num', answer: a * b,
      text: story,
      hints: [
        `What is the story asking you to find? Are there equal groups? Which two numbers will you multiply?`,
        `${a} × ${b} is tricky to do all at once. Break ${b} apart into tens and ones: ${b} = ? + ?`,
        `Multiply ${a} by the tens piece. Then multiply ${a} by the ones piece. Last step: add your two products.`,
      ],
      explain: `${a} × ${b} = (${a} × ${t}) + (${a} × ${o}) = ${a * t} + ${a * o} = ${B(a * b)}.`,
    };
  }

  function dist3Word(name) {
    const a = R(2, 6), h = R(1, 4), t = R(1, 6), o = R(1, 6);
    const n = h * 100 + t * 10 + o;
    const story = pick([
      `The stadium sells ${B(n)} hot dogs at every game. How many hot dogs does it sell in ${B(a)} games?`,
      `Each box holds ${B(n)} beads for team bracelets. ${name} opens ${B(a)} boxes. How many beads is that?`,
      `A school bus drives ${B(n)} miles each week. How many miles does it drive in ${B(a)} weeks?`,
    ]);
    return {
      ...D, word: true, kind: 'num', answer: a * n,
      text: story,
      hints: [
        `The same amount happens again and again — equal groups. Which numbers do you multiply?`,
        `Break ${n} apart by place value: ${n} = hundreds + tens + ones. Write the three pieces on your sketchpad.`,
        `Multiply ${a} by each of the three pieces, one at a time. Then add all three products together.`,
      ],
      explain: `${a} × ${n} = (${a} × ${h * 100}) + (${a} × ${t * 10}) + (${a} × ${o}) = ${a * h * 100} + ${a * t * 10} + ${a * o} = ${B(a * n)}.`,
    };
  }

  function assocNum() {
    const a = R(3, 9), b = R(2, 9);
    return {
      ...D, word: false, kind: 'num', answer: a * b * 10,
      text: `Use the Associative Property to regroup the factors.<div class="eq small">${a} × ${b}0 = ${a} × (${b} × 10)<br>= (${a} × ${b}) × 10 = ${BOX}</div>`,
      hints: [
        `The Associative Property says you can change which factors are grouped together. The product stays the same.`,
        `Look at the last line. What is inside the parentheses? Solve that part first.`,
        `Now multiply that answer by 10. What happens to a number when you multiply it by 10?`,
      ],
      explain: `(${a} × ${b}) × 10 = ${a * b} × 10 = ${B(a * b * 10)}.`,
    };
  }

  function propVocab() {
    const a = R(2, 9), b = R(2, 9), c = R(2, 6);
    const variants = [
      {
        text: `Which property does this equation show?<div class="eq small">${a} × (${b} × 10) = (${a} × ${b}) × 10</div>`,
        correct: 'Associative Property of Multiplication',
        explain: `The factors stay in the same order but the <b>grouping</b> (the parentheses) changes. That is the Associative Property of Multiplication.`,
        hints: [
          `Compare the two sides. Are the same three numbers on both sides?`,
          `What moved — the numbers, or the parentheses?`,
          `One property is about changing how factors are <b>grouped</b>. The other is about <b>breaking apart</b> a factor and adding.`,
        ],
      },
      {
        text: `Which property does this equation show?<div class="eq small">${a} × 1${c} = (${a} × 10) + (${a} × ${c})</div>`,
        correct: 'Distributive Property of Multiplication',
        explain: `1${c} was broken apart into 10 + ${c}, and ${a} multiplies each part. That is the Distributive Property of Multiplication.`,
        hints: [
          `Look at the right side. What happened to 1${c}?`,
          `The ${a} is “handed out” to each piece, and then the pieces are added.`,
          `One property is about changing how factors are <b>grouped</b>. The other is about <b>breaking apart</b> a factor and adding.`,
        ],
      },
    ];
    const v = pick(variants);
    return mc({ ...D, word: false, text: v.text, hints: v.hints, explain: v.explain }, v.correct,
      ['Associative Property of Multiplication', 'Distributive Property of Multiplication', 'Compatible Numbers Property', 'Partial Products Property']);
  }

  /* ───────────────────────── Level 4: partial products & area models ───────────────────────── */

  const P = { skill: 'partial', host: 'coach' };
  const parts = (a, b) => {
    const at = Math.floor(a / 10) * 10, ao = a % 10, bt = Math.floor(b / 10) * 10, bo = b % 10;
    return { at, ao, bt, bo, cells: [at * bt, at * bo, ao * bt, ao * bo] };
  };
  const twoBy = () => [two(1, 6, [2, 3, 4, 5, 6, 7, 8, 9]), two(1, 6, [2, 3, 4, 5, 6, 7, 8, 9])];

  function areaModel(name) {
    const [a, b] = twoBy();
    const p = parts(a, b);
    const story = pick([
      `The team is planting a garden behind the dugout. It is ${B(a)} feet long and ${B(b)} feet wide. Fill in the area model to find its area in square feet.`,
      `${name} is making a team banner with ${B(a)} rows of ${B(b)} snowflake stickers. Fill in the area model to find how many stickers she needs.`,
      `The new stadium floor uses ${B(a)} rows of ${B(b)} tiles. Fill in the area model to find the number of tiles.`,
    ]);
    return {
      ...P, word: true, kind: 'area', a, b, cells: p.cells, answer: a * b,
      text: story,
      hints: [
        `An area model is a rectangle split into 4 smaller rectangles. Each small rectangle is one partial product.`,
        `For each box, multiply the number on its <b>left side</b> by the number on its <b>top</b>. Start with the easiest box — ones × ones.`,
        `For the tens boxes, use a basic fact and count the zeros. When all 4 boxes are full, add them up for the total. Line them up on your sketchpad!`,
      ],
      explain: `${a} × ${b}: ${p.at} × ${p.bt} = ${fmt(p.cells[0])}, ${p.at} × ${p.bo} = ${p.cells[1]}, ${p.ao} × ${p.bt} = ${p.cells[2]}, ${p.ao} × ${p.bo} = ${p.cells[3]}. ` +
        `Add: ${p.cells.map(fmt).join(' + ')} = ${B(a * b)}.`,
    };
  }

  function partialMissing() {
    const [a, b] = twoBy();
    const p = parts(a, b);
    const i = R(0, 3);
    const names = [`${p.at} × ${p.bt}`, `${p.at} × ${p.bo}`, `${p.ao} × ${p.bt}`, `${p.ao} × ${p.bo}`];
    const shown = p.cells.map((c, k) => (k === i ? BOX : fmt(c))).join(' + ');
    return {
      ...P, word: false, kind: 'num', answer: p.cells[i],
      text: `One partial product is missing. What is it?<div class="eq small">${a} × ${b} = ${shown}</div>`,
      hints: [
        `Break both factors into tens and ones: ${a} = ${p.at} + ${p.ao} and ${b} = ${p.bt} + ${p.bo}.`,
        `There should be four partial products: tens × tens, tens × ones, ones × tens, and ones × ones. Which one is not in the list?`,
        `Try working out each of the four on your sketchpad and check them off against the list. The one left over is the missing one.`,
      ],
      explain: `The four partial products are ${names.map((n, k) => `${n} = ${fmt(p.cells[k])}`).join(', ')}. The missing one is ${names[i]} = ${B(p.cells[i])}.`,
    };
  }

  function partialChoice() {
    const [a, b] = twoBy();
    const p = parts(a, b);
    const j = (arr) => arr.map(fmt).join(' + ');
    return mc({
      ...P, word: false,
      text: `Which shows <b>all</b> the partial products for<div class="eq">${a} × ${b}</div>`,
      hints: [
        `Break apart both factors: ${a} = ${p.at} + ${p.ao} and ${b} = ${p.bt} + ${p.bo}.`,
        `Every part of ${a} has to multiply every part of ${b}. How many partial products should there be?`,
        `Check the tens × tens product carefully — ${p.at} × ${p.bt} should be in the hundreds, not a tiny number.`,
      ],
      explain: `${p.at} × ${p.bt} = ${fmt(p.cells[0])}, ${p.at} × ${p.bo} = ${p.cells[1]}, ${p.ao} × ${p.bt} = ${p.cells[2]}, ${p.ao} × ${p.bo} = ${p.cells[3]}. So: ${B(j(p.cells))}.`,
    }, j(p.cells), [
      j([p.cells[0], p.cells[3]]),
      j([p.cells[0] / 100, p.cells[1], p.cells[2], p.cells[3]]),
      j([p.cells[0] / 10, p.cells[1], p.cells[2], p.cells[3]]),
      j([p.cells[0], p.cells[1] + 10, p.cells[2], p.cells[3]]),
    ]);
  }

  function partialVocab() {
    return mc({
      ...P, word: false,
      text: `What are <b>partial products</b>?`,
      hints: [
        `“Partial” means a <b>part</b> of something.`,
        `Think about the area model. What did we write inside each small box?`,
        `Look for the choice that talks about multiplying the <b>parts</b> of the factors and then adding.`,
      ],
      explain: `Partial products are the products you get when you break factors apart and multiply each part. You add them to get the final product.`,
    }, `The products of each part of the factors, which you add to get the final product`,
    [`Numbers that are close to the real numbers`, `The two numbers you multiply together`, `The answer to an addition problem`]);
  }

  function twoByWord(name) {
    const [a, b] = twoBy();
    const p = parts(a, b);
    const story = pick([
      `The bleachers at Snowflake Stadium have ${B(a)} rows. Each row has ${B(b)} seats. How many seats are there in all?`,
      `The team shop has ${B(a)} boxes of trading cards. Each box has ${B(b)} cards. How many cards are there?`,
      `The outfield is ${B(a)} yards long and ${B(b)} yards wide. What is its area in square yards?`,
      `${B(a)} players each sell ${B(b)} raffle tickets for new uniforms. How many tickets do they sell in all?`,
      `${name} practices hitting for ${B(b)} minutes each day. How many minutes does she practice in ${B(a)} days?`,
      `The snack stand packs ${B(a)} boxes of pretzels with ${B(b)} pretzels in each box. How many pretzels is that?`,
    ]);
    return {
      ...P, word: true, kind: 'num', answer: a * b,
      text: story,
      hints: [
        `What is the story asking for? Look for equal groups (or rows). Which two numbers do you need to multiply?`,
        `Break both numbers into tens and ones. Try sketching a box split into 4 parts on your sketchpad — an area model!`,
        `You need four partial products: tens × tens, tens × ones, ones × tens, and ones × ones. Then add all four. Remember: tens × tens makes hundreds.`,
      ],
      explain: `${a} × ${b}: ${p.at} × ${p.bt} = ${fmt(p.cells[0])}, ${p.at} × ${p.bo} = ${p.cells[1]}, ${p.ao} × ${p.bt} = ${p.cells[2]}, ${p.ao} × ${p.bo} = ${p.cells[3]}. ` +
        `Add: ${p.cells.map(fmt).join(' + ')} = ${B(a * b)}.`,
    };
  }

  /* ───────────────────────── Championship extras: two-step stories ───────────────────────── */

  function multiStep(name) {
    const v = R(0, 2);
    if (v === 0) {
      const [a, b] = twoBy();
      const c = R(2, 9) * 10;
      return {
        ...P, word: true, kind: 'num', answer: a * b - c,
        text: `The team bakes ${B(a)} trays of cookies with ${B(b)} cookies on each tray. Then the players eat ${B(c)} cookies. How many cookies are left to sell?`,
        hints: [
          `This story has <b>two steps</b>. What do you need to know first, before you can find how many are left?`,
          `Step 1: find how many cookies were baked in all. That is ${a} groups of ${b} — use partial products.`,
          `Step 2: some cookies got eaten. Should the number of cookies go up or down? Which operation does that?`,
        ],
        explain: `Step 1: ${a} × ${b} = ${fmt(a * b)} cookies baked. Step 2: ${fmt(a * b)} − ${c} = ${B(a * b - c)} cookies left.`,
      };
    }
    if (v === 1) {
      const a = R(3, 9), b = two(1, 4, [2, 3, 4, 6, 7, 8]);
      const have = R(1, 2) * 10;
      return {
        ...D, word: true, kind: 'num', answer: a * b - have,
        text: `Coach wants every one of the ${B(b)} players to have ${B(a)} practice softballs. The team already has ${B(have)} softballs. How many <b>more</b> softballs does Coach need to buy?`,
        hints: [
          `This story has <b>two steps</b>. First: how many softballs are needed altogether?`,
          `Step 1 is equal groups: ${b} players with ${a} softballs each. Break apart ${b} to multiply.`,
          `Step 2: the team already has some. How do you find how many <b>more</b> they need?`,
        ],
        explain: `Step 1: ${a} × ${b} = ${fmt(a * b)} softballs needed. Step 2: ${fmt(a * b)} − ${have} = ${B(a * b - have)} more softballs.`,
      };
    }
    const b = two(1, 4, [2, 3, 4, 6, 7, 8]);
    const a = R(11, 19), c = 30 - a;   // rows add up to a friendly 30
    return {
      ...P, word: true, kind: 'num', answer: (a + c) * b,
      text: `The home side of the stadium has ${B(a)} rows of seats. The visitor side has ${B(c)} rows. Every row has ${B(b)} seats. How many seats are there in all?`,
      hints: [
        `There are two sides, but every row has the same number of seats. What could you find first?`,
        `Try finding the total number of rows first. Then you only have to multiply once!`,
        `Once you know the total rows, multiply rows × seats in each row. A multiple of ten makes this one friendly.`,
      ],
      explain: `Rows: ${a} + ${c} = 30. Seats: 30 × ${b} = 3 tens × ${b} = ${B(30 * b)}. (You could also do ${a} × ${b} and ${c} × ${b} and add.)`,
    };
  }

  /* ───────────────────────── Round builders ───────────────────────── */

  const builders = {
    multiples: (n) => [multBare(), multPattern(), multWord(n), multWord(n), multMissing(), multTensWord(n), multWord(n), multTensWord(n)],
    estimate: (n) => [estVocab(), estWord(n), estBest(), estWord(n), est3Word(), estReasonable(), estEnough(n), estWord(n)],
    distributive: (n) => [distBlank(), propVocab(), distWord(n), distExpr(), distWord(n), assocNum(), dist3Word(n), distWord(n)],
    partial: (n) => [partialVocab(), partialMissing(), areaModel(n), partialChoice(), twoByWord(n), areaModel(n), twoByWord(n), twoByWord(n)],
    champ: (n) => [
      multWord(n), multTensWord(n), estWord(n), pick([estReasonable, estEnough])(n), distWord(n),
      pick([propVocab, partialVocab, estVocab])(), twoByWord(n), areaModel(n), multiStep(n), twoByWord(n),
    ],
  };

  /** A fresh question on the same skill, used to retry something that was missed. */
  const retry = {
    multiples: (n) => pick([multWord, multTensWord])(n),
    estimate: (n) => pick([estWord, est3Word])(n),
    distributive: (n) => distWord(n),
    partial: (n) => twoByWord(n),
  };

  window.KM = window.KM || {};
  window.KM.Questions = {
    build: (levelId, name) => builders[levelId](name),
    retry: (skill, name) => retry[skill](name),
    fmt,
  };
})();
