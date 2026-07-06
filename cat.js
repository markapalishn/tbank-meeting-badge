/* Пиксельный кот-тамагочи для бейджа.
   Спрайты собираются из «деталей» (голова, тело, лапы, хвост) на сетке
   32×24, каждый символ — один пиксель. Точка — прозрачность. */
(function () {
  'use strict';

  /* ═══ Сцена ═══ */

  const css = getComputedStyle(document.documentElement);
  const CARD_W = parseInt(css.getPropertyValue('--card-width')) || 690;

  const SCALE = 4;
  const GRID_W = 32, GRID_H = 24;
  const W = GRID_W * SCALE;   // 128
  const H = GRID_H * SCALE;   // 96

  const FLOOR = 176;          // линия ног: перед нижним краем верхнего ряда
  const FLOOR2 = 352;         // линия ног: свободная зона ниже карточки, правее текста
  const ROOF = 10;            // линия ног: на верхней кромке плашки с именем

  /* ═══ Палитра ═══ */

  const PALETTE = {
    O: '#3a2a20', // контур
    B: '#e69a45', // рыжая шерсть
    S: '#c1732e', // полоски и дальние лапы
    L: '#f8e3c0', // грудка, мордочка, кончик хвоста
    P: '#ef9f9c', // уши, нос
    E: '#241811', // глаза
    W: '#ffffff', // блик
    R: '#d9534a', // кружка, сердечко
    Y: '#ffdd2d', // бабочка, эмоции
  };

  /* ═══ Детали спрайта ═══ */

  const HEAD = [
    '..OO.....OO..',
    '.OBPO...OPBO.',
    '.OBBPO.OPBBO.',
    'OBBBBOOOBBBBO',
    'OBBBBBBBBBBBO',
    'OBBEWBBBEWBBO',
    'OBBEEBBBEEBBO',
    'OBBBBBPPBBBBO',
    'OBBLLLLLLLBBO',
    '.OBLLLLLLLBO.',
    '..OOLLLLLOO..',
    '....OOOOO....',
  ];

  // Закрытые глаза (моргание, сон)
  const HEAD_CLOSED = HEAD.map((row, i) => {
    if (i === 5) return 'OBBBBBBBBBBBO';
    if (i === 6) return 'OBBEEBBBEEBBO';
    return row;
  });

  const BODY_SIDE = [
    '...OOOOOOOOOOOOBBBB..',
    '..OBBBBBBBBBBBBBBBBBO',
    '.OBBSBBSBBSBBBBBBBBO.',
    'OBBBSBBSBBSBBBBBBBBO.',
    'OBBBBBBBBBBBBBBBBBBO.',
    'OBBBBBBBBBBBBBBBBBBO.',
    '.OBBLLLLLLLLLBBBBBO..',
    '..OOOOOOOOOOOOOOOOO..',
  ];

  const BODY_LOW = [
    '..OOOOOOOOOOOOOO...',
    '.OBBSBBSBBSBBBBBO..',
    'OBBBSBBSBBSBBBBBBO.',
    'OBBBBBBBBBBBBBBBBO.',
    '.OBBLLLLLLLLLBBBO..',
    '..OOOOOOOOOOOOOO...',
  ];

  const LEGS_STAND = [
    '..OBO.SS...SS.OBO..',
    '..OBO.SS...SS.OBO..',
    '..OBO.SS...SS.OBO..',
    '..OBO.SS...SS.OBO..',
    '..OBO.SS...SS.OBO..',
    '..OOO.........OOO..',
  ];

  const LEGS_WALK_A = [
    '..OBO..SS.SS..OBO..',
    '..OBO..SS.SS..OBO..',
    '..OBO..SS.SS..OBO..',
    '..OBO..SS.SS..OBO..',
    '..OBO.........OBO..',
    '..OOO.........OOO..',
  ];

  const LEGS_WALK_B = [
    '..OBO.SS...SS.OBO..',
    '..OBO.SS...SS.OBO..',
    '..OBO.SS...SS.OBO..',
    '..OOO.SS...SS.OOO..',
    '......SS...SS......',
    '...................',
  ];

  const LEGS_FOLDED = [
    '.OBBO........OBBO..',
    '.OOOO........OOOO..',
  ];

  const LEGS_POUNCE = [
    '..OBO........OBO...',
    '.OBO..........OBO..',
    'OBO............OBO.',
    'OLO............OLO.',
  ];

  const TAIL_UP = [
    '.OO..',
    'OLLO.',
    'OLLO.',
    'OBBO.',
    'OBBO.',
    '.OBBO',
    '..OBO',
  ];

  const TAIL_UP2 = [
    '..OO.',
    '.OLLO',
    '.OLLO',
    '.OBBO',
    'OBBO.',
    'OBBO.',
    '.OBO.',
  ];

  const TAIL_SIT = [
    '.OOOOO.',
    'OBBBLLO',
    '.OOOOO.',
  ];

  const SIT_BODY = [
    '...OBBBBBBBO.....',
    '..OBBBBBBBBBO....',
    '.OBSBBSBBBBBBO...',
    '.OBSBBSBBBBBBO...',
    'OBBSBBSBBBOBOBO..',
    'OBBBBBBBBBOBOBO..',
    'OBBBBBBBBBOBOBO..',
    'OBBBBBBBBBOBOBO..',
    'OBBBBBBBBBOBOBO..',
    '.OBBBBBBBBOBOBO..',
    '.OBBBBBBBBOBOBO..',
    '..OBBBBBBBOLOLO..',
    '...OOOOOOOOOOOO..',
  ];

  const GROOM_BODY = [
    '...OBBBBBBBO.....',
    '..OBBBBBBBBBO....',
    '.OBSBBSBBBBBBO...',
    '.OBSBBSBBBBBBO...',
    'OBBSBBSBBBOBO....',
    'OBBBBBBBBBOBO....',
    'OBBBBBBBBBOBO....',
    'OBBBBBBBBBOBO....',
    'OBBBBBBBBBOBO....',
    '.OBBBBBBBBOBO....',
    '.OBBBBBBBBOBO....',
    '..OBBBBBBBOLO....',
    '...OOOOOOOOOO....',
  ];

  const PAW_UP = [
    'OOO',
    'OLO',
    'OBO',
    'OBO',
    'OBO',
    'OBO',
    'OBO',
  ];

  const SLEEP_BODY = [
    '.....OOOOOOOOO......',
    '...OOBBBBBBBBBOO....',
    '..OBBSBBSBBSBBBBO...',
    '.OBBSBBSBBSBBBBBBO..',
    'OBBBBBBBBBBBBBBBBBO.',
    'OBBBBBBBBBBBBBBBBBO.',
    'OBBBBBBBBBBBBBBBBBO.',
    '.OBBBBBBBBBBBBBBBO..',
    '..OOOOOOOOOOOOOOO...',
  ];

  const STRETCH_BODY = [
    '...OOOO..........',
    '..OBBBBO.........',
    '.OBSBBSBOO.......',
    '.OBBSBBSBBOO.....',
    'OBBBBBBBBBBBOO...',
    'OBBBBBBBBBBBBBOO.',
    'OBBBBBBBBBBBBBBBO',
    '.OBBOBBOBBBBBBBBO',
    '..OBO.OBO........',
    '..OBO.OBO........',
    '..OLO.OLO........',
    '..OOO.OOO........',
  ];

  const FRONT_FLAT = [
    '.OOOOOO.',
    'OBBBBLLO',
    '.OOOOOO.',
  ];

  /* ═══ Сборка кадров ═══ */

  function emptyGrid() {
    return Array.from({ length: GRID_H }, () => Array(GRID_W).fill('.'));
  }

  function stamp(grid, art, x, y) {
    art.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) {
        const ch = row[dx];
        if (ch === '.' || ch === ' ') continue;
        const gx = x + dx, gy = y + dy;
        if (gy >= 0 && gy < GRID_H && gx >= 0 && gx < GRID_W) grid[gy][gx] = ch;
      }
    });
  }

  const FRAMES = {};

  function makeFrame(name, parts) {
    const g = emptyGrid();
    parts.forEach(([art, x, y]) => stamp(g, art, x, y));
    FRAMES[name] = g.map(r => r.join(''));
  }

  // Стоит / идёт (мордой вправо)
  makeFrame('stand', [
    [TAIL_UP, 0, 6], [BODY_SIDE, 3, 11], [LEGS_STAND, 3, 18], [HEAD, 17, 1],
  ]);
  makeFrame('walk1', [
    [TAIL_UP, 0, 6], [BODY_SIDE, 3, 11], [LEGS_WALK_A, 3, 18], [HEAD, 17, 1],
  ]);
  makeFrame('walk2', [
    [TAIL_UP2, 0, 6], [BODY_SIDE, 3, 11], [LEGS_WALK_B, 3, 18], [HEAD, 17, 1],
  ]);

  // Сидит
  makeFrame('sit', [
    [SIT_BODY, 2, 11], [TAIL_SIT, 13, 21], [HEAD, 4, 0],
  ]);
  makeFrame('sit-blink', [
    [SIT_BODY, 2, 11], [TAIL_SIT, 13, 21], [HEAD_CLOSED, 4, 0],
  ]);

  // Умывается
  makeFrame('groom1', [
    [GROOM_BODY, 2, 11], [TAIL_SIT, 12, 21], [HEAD, 4, 0], [PAW_UP, 14, 8],
  ]);
  makeFrame('groom2', [
    [GROOM_BODY, 2, 11], [TAIL_SIT, 12, 21], [HEAD_CLOSED, 4, 0], [PAW_UP, 14, 10],
  ]);

  // Спит клубком
  makeFrame('sleep', [
    [SLEEP_BODY, 2, 15], [HEAD_CLOSED, 13, 6], [TAIL_SIT, 16, 21],
  ]);

  // Крадётся / готовится к прыжку
  makeFrame('crouch1', [
    [TAIL_UP, 0, 9], [BODY_LOW, 3, 16], [LEGS_FOLDED, 3, 22], [HEAD, 17, 8],
  ]);
  makeFrame('crouch2', [
    [TAIL_UP2, 0, 9], [BODY_LOW, 3, 16], [LEGS_FOLDED, 3, 22], [HEAD, 17, 8],
  ]);

  // Прыжок
  makeFrame('pounce', [
    [TAIL_UP2, 0, 4], [BODY_SIDE, 3, 10], [LEGS_POUNCE, 3, 17], [HEAD, 17, 0],
  ]);

  // Потягивается
  makeFrame('stretch', [
    [TAIL_UP, 0, 6], [STRETCH_BODY, 1, 12], [HEAD, 16, 9], [FRONT_FLAT, 17, 21],
  ]);

  /* ═══ Реквизит ═══ */

  const BUTTERFLY_A = [
    'YYY...YYY',
    'YYYY.YYYY',
    '.YYYOYYY.',
    '.YYYOYYY.',
    '..YYOYY..',
  ];
  const BUTTERFLY_B = [
    '...Y.Y...',
    '..YY.YY..',
    '..YYOYY..',
    '...YOY...',
    '....O....',
  ];

  const MUG = [
    '.OOOOOO...',
    'OLLLLLLO..',
    'ORRRRRROO.',
    'ORRRRRRO.O',
    'ORRRRRRO.O',
    'ORRRRRROO.',
    'ORRRRRRO..',
    '.OOOOOO...',
  ];

  const EM_EXCLAIM = ['YY', 'YY', 'YY', 'YY', 'YY', '..', 'YY'];
  const EM_QUESTION = ['.YYY.', 'Y...Y', '....Y', '...Y.', '..Y..', '.....', '..Y..'];
  const EM_HEART = ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];
  const EM_Z = ['YYYY', '..Y.', '.Y..', 'YYYY'];

  /* ═══ Рендер сетки в SVG ═══ */

  const NS = 'http://www.w3.org/2000/svg';

  function svgFromGrid(rows, scale) {
    const w = Math.max(...rows.map(r => r.length));
    const h = rows.length;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('shape-rendering', 'crispEdges');
    if (scale) {
      svg.style.width = w * scale + 'px';
      svg.style.height = h * scale + 'px';
    }
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') { x++; continue; }
        let x2 = x + 1;
        while (x2 < row.length && row[x2] === ch) x2++;
        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', x2 - x);
        rect.setAttribute('height', 1);
        rect.setAttribute('fill', PALETTE[ch] || '#f0f');
        svg.appendChild(rect);
        x = x2;
      }
    });
    return svg;
  }

  /* Отладочный лист со всеми кадрами */
  if (window.CAT_DEBUG) {
    const sheet = document.createElement('div');
    sheet.style.cssText = 'display:flex;flex-wrap:wrap;gap:24px;padding:24px;background:#8fa3ad;font-family:monospace;';
    Object.keys(FRAMES).forEach(name => {
      const cell = document.createElement('div');
      cell.style.cssText = 'text-align:center;color:#222;';
      const svg = svgFromGrid(FRAMES[name], 6);
      svg.style.background = 'rgba(255,255,255,.25)';
      cell.appendChild(svg);
      const label = document.createElement('div');
      label.textContent = name;
      cell.appendChild(label);
      sheet.appendChild(cell);
    });
    [['butterfly A', BUTTERFLY_A], ['butterfly B', BUTTERFLY_B], ['mug', MUG],
     ['!', EM_EXCLAIM], ['?', EM_QUESTION], ['heart', EM_HEART], ['z', EM_Z]].forEach(([n, art]) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'text-align:center;color:#222;';
      const svg = svgFromGrid(art, 6);
      svg.style.background = 'rgba(255,255,255,.25)';
      cell.appendChild(svg);
      const label = document.createElement('div');
      label.textContent = n;
      cell.appendChild(label);
      sheet.appendChild(cell);
    });
    document.body.appendChild(sheet);
    return;
  }

  /* ═══ DOM ═══ */

  const container = document.querySelector('.badge-container');
  const cat = document.querySelector('.cat');

  const frameEls = {};
  Object.keys(FRAMES).forEach(name => {
    const svg = svgFromGrid(FRAMES[name]);
    svg.classList.add('cat__frame');
    svg.style.display = 'none';
    cat.appendChild(svg);
    frameEls[name] = svg;
  });

  const emoteEl = document.createElement('div');
  emoteEl.className = 'cat__emote';
  cat.appendChild(emoteEl);

  const bflyEl = document.createElement('div');
  bflyEl.className = 'butterfly';
  const bflyFrames = [svgFromGrid(BUTTERFLY_A, 3), svgFromGrid(BUTTERFLY_B, 3)];
  bflyFrames.forEach(s => bflyEl.appendChild(s));
  bflyEl.style.display = 'none';
  container.appendChild(bflyEl);

  const laserEl = document.createElement('div');
  laserEl.className = 'laser';
  laserEl.style.display = 'none';
  container.appendChild(laserEl);

  const mugEl = document.createElement('div');
  mugEl.className = 'mug';
  mugEl.appendChild(svgFromGrid(MUG, 3));
  mugEl.style.display = 'none';
  container.appendChild(mugEl);

  /* ═══ Анимационные утилиты ═══ */

  const easings = {
    linear: t => t,
    ease: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeOut: t => t * (2 - t),
    easeIn: t => t * t,
  };

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function tween(el, to, dur, easing) {
    return new Promise(resolve => {
      const from = {};
      for (const k in to) from[k] = parseFloat(el.style[k]) || 0;
      const ease = easings[easing] || easings.linear;
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = ease(t);
        for (const k in to) el.style[k] = from[k] + (to[k] - from[k]) * e + 'px';
        t < 1 ? requestAnimationFrame(tick) : resolve();
      })(performance.now());
    });
  }

  /* ═══ Кот: состояние и движение ═══ */

  let px = -W - 20, pfeet = FLOOR;

  function setPos(x, feetY) {
    px = x; pfeet = feetY;
    cat.style.left = x + 'px';
    cat.style.top = (feetY - H) + 'px';
  }

  function face(dir) {
    cat.classList.toggle('flip', dir === 'left');
  }

  const STATE_CLASS = { walk: 'walking', run: 'walking', sleep: 'sleeping', groom: 'grooming' };

  const STATES = {
    stand:      { frames: ['stand'] },
    walk:       { frames: ['walk1', 'walk2'], ms: 170 },
    run:        { frames: ['walk1', 'walk2'], ms: 95 },
    sit:        { frames: ['sit', 'sit-blink'], durations: [2300, 140] },
    groom:      { frames: ['groom1', 'groom2'], ms: 300 },
    sleep:      { frames: ['sleep'] },
    crouch:     { frames: ['crouch1', 'crouch2'], ms: 340 },
    crouchStill:{ frames: ['crouch1'] },
    wiggle:     { frames: ['crouch1', 'crouch2'], ms: 110 },
    pounce:     { frames: ['pounce'] },
    stretch:    { frames: ['stretch'] },
  };

  let frameTimer = null;

  function setState(name) {
    const st = STATES[name];
    clearTimeout(frameTimer);
    Object.values(STATE_CLASS).forEach(c => cat.classList.remove('cat--' + c));
    if (STATE_CLASS[name]) cat.classList.add('cat--' + STATE_CLASS[name]);
    let i = 0;
    (function step() {
      const idx = i % st.frames.length;
      Object.values(frameEls).forEach(el => { el.style.display = 'none'; });
      frameEls[st.frames[idx]].style.display = '';
      if (st.frames.length > 1) {
        const d = st.durations ? st.durations[idx] : st.ms;
        i++;
        frameTimer = setTimeout(step, d);
      }
    })();
  }

  // Ходьба/бег к точке; скорость задаётся состоянием
  async function move(x, feetY, state) {
    const dx = x - px;
    if (Math.abs(dx) > 2) face(dx < 0 ? 'left' : 'right');
    const dist = Math.max(Math.abs(dx), Math.abs(feetY - pfeet));
    const speed = state === 'run' ? 0.42 : state === 'crouch' ? 0.045 : 0.14; // px за мс
    setState(state || 'walk');
    await tween(cat, { left: x, top: feetY - H }, dist / speed, 'linear');
    px = x; pfeet = feetY;
  }

  // Прыжок по дуге
  function jumpArc(toX, toFeetY, height, dur) {
    return new Promise(resolve => {
      const fromX = px, fromY = pfeet;
      setState('pounce');
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toFeetY - fromY) * t - height * 4 * t * (1 - t);
        cat.style.left = x + 'px';
        cat.style.top = (y - H) + 'px';
        if (t < 1) requestAnimationFrame(tick);
        else { px = toX; pfeet = toFeetY; resolve(); }
      })(performance.now());
    });
  }

  /* ═══ Эмоции ═══ */

  const EMOTES = { '!': EM_EXCLAIM, '?': EM_QUESTION, heart: EM_HEART };

  async function emote(type, ms) {
    emoteEl.innerHTML = '';
    emoteEl.className = 'cat__emote cat__emote--pop';
    emoteEl.appendChild(svgFromGrid(EMOTES[type], 3));
    emoteEl.style.display = '';
    await delay(ms || 1100);
    emoteEl.style.display = 'none';
    emoteEl.className = 'cat__emote';
  }

  function zzzShow() {
    emoteEl.innerHTML = '';
    emoteEl.className = 'cat__emote cat__emote--zzz';
    for (let i = 0; i < 3; i++) emoteEl.appendChild(svgFromGrid(EM_Z, 3));
    emoteEl.style.display = '';
  }

  function zzzHide() {
    emoteEl.style.display = 'none';
    emoteEl.className = 'cat__emote';
  }

  /* ═══ Бабочка ═══ */

  const bfly = { x: 0, y: 0, frame: 0, flap: null };

  function bflyShow(x, y) {
    bfly.x = x; bfly.y = y;
    bflyEl.style.left = x + 'px';
    bflyEl.style.top = y + 'px';
    bflyEl.style.display = '';
    clearInterval(bfly.flap);
    bfly.flap = setInterval(() => {
      bfly.frame = 1 - bfly.frame;
      bflyFrames[0].style.display = bfly.frame ? 'none' : '';
      bflyFrames[1].style.display = bfly.frame ? '' : 'none';
    }, 120);
  }

  function bflyHide() {
    bflyEl.style.display = 'none';
    clearInterval(bfly.flap);
  }

  // Полёт с лёгкой синусоидой
  function bflyTo(x, y, dur, wobble) {
    const amp = wobble === undefined ? 12 : wobble;
    return new Promise(resolve => {
      const fx = bfly.x, fy = bfly.y;
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = easings.ease(t);
        bfly.x = fx + (x - fx) * e;
        bfly.y = fy + (y - fy) * e + Math.sin(t * Math.PI * 4) * amp * (1 - t);
        bflyEl.style.left = bfly.x + 'px';
        bflyEl.style.top = bfly.y + 'px';
        t < 1 ? requestAnimationFrame(tick) : resolve();
      })(performance.now());
    });
  }

  // Точка носа — чтобы бабочка могла сесть на нос
  function nosePoint() {
    const flipped = cat.classList.contains('flip');
    return { x: flipped ? px + W - 96 : px + 88, y: pfeet - H + 28 };
  }

  /* ═══ Лазерная точка ═══ */

  function laserShow(x, y) {
    laserEl.style.left = x + 'px';
    laserEl.style.top = y + 'px';
    laserEl.style.display = '';
  }

  function laserMove(x, y) {
    laserEl.style.left = x + 'px';
    laserEl.style.top = y + 'px';
  }

  function laserHide() { laserEl.style.display = 'none'; }

  /* ═══ Кружка ═══ */

  function mugShow(x, topY) {
    mugEl.style.left = x + 'px';
    mugEl.style.top = topY + 'px';
    mugEl.style.opacity = '1';
    mugEl.style.transform = '';
    mugEl.style.transition = '';
    mugEl.style.display = '';
  }

  async function mugNudge(angle, dx) {
    const left = parseFloat(mugEl.style.left);
    mugEl.style.transition = 'transform .12s ease-out, left .12s ease-out';
    mugEl.style.transform = 'rotate(' + angle + 'deg)';
    mugEl.style.left = left + dx + 'px';
    await delay(140);
    mugEl.style.transform = '';
  }

  async function mugFall() {
    const left = parseFloat(mugEl.style.left);
    mugEl.style.transition = 'left .55s cubic-bezier(.4,0,1,1), top .55s cubic-bezier(.4,0,1,1), transform .55s linear';
    mugEl.style.left = left + 36 + 'px';
    mugEl.style.top = FLOOR - 26 + 'px';
    mugEl.style.transform = 'rotate(-104deg)';
    await delay(600);
  }

  async function mugHideSoft() {
    mugEl.style.transition = 'opacity .6s';
    mugEl.style.opacity = '0';
    await delay(650);
    mugEl.style.display = 'none';
  }

  /* ═══ Общие ходы ═══ */

  async function walkIn(fromLeft, toX, feetY, state) {
    const y = feetY || FLOOR;
    setPos(fromLeft ? -W - 10 : CARD_W + 10, y);
    await move(toX, y, state || 'walk');
  }

  async function leave(toRight, state) {
    await move(toRight ? CARD_W + W : -W - 20, pfeet, state || 'walk');
  }

  async function lookAround() {
    face('left');
    await delay(550);
    face('right');
    await delay(550);
  }

  /* ═══ Сценарий: охота на бабочку ═══ */

  async function butterflyHunt() {
    bflyShow(CARD_W + 30, 160);
    const flight = bflyTo(460, 306, 2600);

    await walkIn(true, 150);
    await flight;

    // Заметил
    setState('stand');
    await emote('!', 900);

    // Крадётся и виляет хвостом
    await move(280, FLOOR, 'crouch');
    setState('wiggle');
    await delay(1000);

    // Прыжок — бабочка ускользает
    const dart = (async () => { await delay(120); await bflyTo(560, 140, 700, 4); })();
    await jumpArc(400, FLOOR2, 46, 620);
    await dart;

    // Растерялся
    setState('sit');
    await emote('?', 1000);
    await lookAround();

    // Бабочка садится на нос
    const nose = nosePoint();
    await bflyTo(nose.x - 12, nose.y - 18, 1400, 6);
    setState('sit');
    await delay(1600);

    // Улетает — кот пытается её поймать и убегает следом
    const away = bflyTo(CARD_W + 40, 120, 1300, 6);
    await delay(250);
    await jumpArc(px + 46, FLOOR2, 34, 320);
    setState('run');
    await away;
    bflyHide();
    await leave(true, 'run');
  }

  /* ═══ Сценарий: лазерная точка ═══ */

  async function laserChase() {
    await walkIn(false, 400, FLOOR2);
    setState('sit');
    await delay(900);
    setState('groom');
    await delay(2200);

    // Точка!
    laserShow(90, 116);
    setState('stand');
    await emote('!', 800);

    const spots = [
      { x: 90, y: 116 },
      { x: 500, y: 70 },
      { x: 260, y: 162 },
    ];
    for (const s of spots) {
      laserMove(s.x, s.y);
      const target = Math.min(Math.max(s.x - 92, -14), CARD_W - W + 14);
      await move(target, FLOOR, 'run');
      await jumpArc(target + 18, FLOOR, 24, 300);
      setState('crouchStill');
      await delay(420);
    }

    // Накрыл лапами — а точки нет
    laserHide();
    await delay(800);
    setState('sit');
    await emote('?', 1100);
    await lookAround();

    // Точка появляется у него на спине — но он уже не видит
    laserShow(px + 34, pfeet - H + 44);
    await delay(900);
    laserHide();
    await delay(400);
    await leave(false);
  }

  /* ═══ Сценарий: кружка с полки ═══ */

  async function mugHeist() {
    // Кружка стоит на правом краю плашки с именем
    mugShow(600, -21);
    await delay(300);

    await walkIn(true, 430);
    setState('sit');
    await delay(700);
    await emote('!', 900);

    // Запрыгивает на плашку
    setState('crouchStill');
    await delay(500);
    await jumpArc(468, ROOF, 46, 520);
    setState('crouchStill');
    await delay(400);

    // Крадётся к кружке
    await move(498, ROOF, 'crouch');
    setState('crouchStill');
    await delay(900);

    // Толкает: раз... два... и в пропасть
    await mugNudge(-7, 0);
    await delay(900);
    await mugNudge(-10, 8);
    await delay(1100);
    await mugFall();

    // Смотрит вниз на дело лап своих
    await move(576, ROOF, 'crouch');
    await delay(1300);

    // Спрыгивает, обнюхивает, доволен
    await jumpArc(560, FLOOR, 30, 480);
    setState('crouchStill');
    await delay(900);
    setState('sit');
    await emote('heart', 1300);

    // Уходит с чувством выполненного долга
    await leave(true);
    await mugHideSoft();
  }

  /* ═══ Сценарий: тихий час ═══ */

  async function catNap() {
    await walkIn(false, 22);
    face('right');

    setState('stretch');
    await delay(1500);
    setState('sit');
    await delay(1200);
    setState('groom');
    await delay(3000);

    // Сворачивается и засыпает
    setState('sleep');
    zzzShow();
    await delay(3500);

    // Мимо пролетает бабочка — ухо не дрогнуло
    bflyShow(CARD_W + 30, 40);
    bflyTo(-40, 90, 3200).then(bflyHide);
    await delay(4500);

    // Просыпается
    zzzHide();
    setState('sit');
    await delay(1400);
    setState('stretch');
    await delay(1300);

    await leave(false);
  }

  /* ═══ Цикл жизни ═══ */

  const scenarios = [butterflyHunt, laserChase, mugHeist, catNap];
  const names = ['butterfly', 'laser', 'mug', 'nap'];
  // ?scenario=butterfly|laser|mug|nap — прогонять один сценарий (для отладки)
  const forced = names.indexOf(new URLSearchParams(location.search).get('scenario'));
  let lastIdx = -1;

  async function cycle() {
    let idx;
    if (forced >= 0) {
      idx = forced;
    } else {
      do { idx = Math.floor(Math.random() * scenarios.length); } while (idx === lastIdx);
    }
    lastIdx = idx;
    window.__catScenario = names[idx];
    await scenarios[idx]();
    await delay(forced >= 0 ? 2000 : 14000 + Math.random() * 8000);
    cycle();
  }

  setPos(-W - 20, FLOOR);
  setState('stand');
  setTimeout(cycle, 1500);
})();
