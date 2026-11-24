/* Пиксельный кот-тамагочи для бейджа.
   Спрайты собираются из «деталей» (голова, тело, лапы, хвост) на сетке
   32×29, каждый символ — один пиксель. Точка — прозрачность. */
(function () {
  'use strict';

  /* ═══ Сцена ═══ */

  const css = getComputedStyle(document.documentElement);
  const CARD_W = parseInt(css.getPropertyValue('--card-width')) || 690;

  const SCALE = 4;
  const HAT_SPACE = 5;
  const GRID_W = 32, GRID_H = 24 + HAT_SPACE;
  const W = GRID_W * SCALE;   // 128
  const H = GRID_H * SCALE;   // 116

  const ROOF = -4;
  const LEFT = 26;
  const RIGHT = CARD_W - W - 24;

  /* ═══ Палитра ═══ */

  const PALETTE = {
    O: '#3a2a20', // контур
    B: '#e69a45', // рыжая шерсть
    S: '#c1732e', // полоски и дальние лапы
    L: '#f8e3c0', // грудка, мордочка, кончик хвоста
    P: '#ef9f9c', // уши, нос
    E: '#241811', // глаза
    W: '#ffffff', // блик
    I: '#bee3ed', // ледяная тень
    C: '#a32338', // тень на колпаке
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

  const HAT = [
    '....CCCCCC....',
    '..CCRRRRRRC...',
    '.CRRRRRRRRRC..',
    'WWWRRCRRRRRRC.',
    'WIWCCCRRRRRRRC',
    '.I..WWWWWWWWWW',
    '....IIIIIIIIII',
  ];

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
    '..OBO.OBO..OBO.OBO.',
    '..OBO.OBO..OBO.OBO.',
    '..OBO.OBO..OBO.OBO.',
    '..OBO.OBO..OBO.OBO.',
    '..OBO.OOO..OOO.OBO.',
    '..OOO..........OOO.',
  ];

  // Шаг 1: внешние лапы расставлены, внутренняя пара собрана и поднята
  const LEGS_WALK_A = [
    '..OBO..OBOOBO..OBO.',
    '..OBO..OBOOBO..OBO.',
    '..OBO..OBOOBO..OBO.',
    '..OBO..OOOOOO..OBO.',
    '..OBO..........OBO.',
    '..OOO..........OOO.',
  ];

  // Шаг 2: внутренняя пара стоит, внешние лапы подняты
  const LEGS_WALK_B = [
    '.OBO..OBOOBO...OBO.',
    '.OBO..OBOOBO...OBO.',
    '.OOO..OBOOBO...OOO.',
    '......OBOOBO.......',
    '......OBOOBO.......',
    '......OOOOOO.......',
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
    parts.forEach(([art, x, y]) => {
      stamp(g, art, x, y + HAT_SPACE);
      if (art === HEAD || art === HEAD_CLOSED) stamp(g, HAT, x - 1, y);
    });
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

  const FLAKE_A = [
    '....W....', '.I..W..I.', '..W.W.W..', '...WWW...',
    'IIWWWWWII', '...WWW...', '..W.W.W..', '.I..W..I.', '....W....',
  ];
  const FLAKE_B = [
    '...W...', '.I.W.I.', '..WWW..', 'IIWWWII', '..WWW..', '.I.W.I.', '...W...',
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
    [['snowflake A', FLAKE_A], ['snowflake B', FLAKE_B], ['mug', MUG],
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

  // На референсе ширина карточки — 446 px в пересчёте на кадр 1920×1080.
  function fitBadge() {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080) * 446 / CARD_W;
    container.style.setProperty('--badge-scale', scale);
  }
  fitBadge();
  window.addEventListener('resize', fitBadge);

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

  const flakeEl = document.createElement('div');
  flakeEl.className = 'snowflake';
  const flakeFrames = [svgFromGrid(FLAKE_A, 3), svgFromGrid(FLAKE_B, 3)];
  flakeFrames.forEach(s => flakeEl.appendChild(s));
  flakeEl.style.display = 'none';
  container.appendChild(flakeEl);

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

  let px = LEFT, pfeet = ROOF;

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

  const pawTrail = document.querySelector('.paw-trail');

  function leavePawPrint(step) {
    const leftward = cat.classList.contains('flip');
    // Задняя лапа в локальных координатах спрайта, отражённых при развороте.
    const foot = step % 2 ? 22 : 34;
    const x = parseFloat(cat.style.left) + (leftward ? W - foot : foot);
    const print = document.createElementNS(NS, 'use');
    print.setAttribute('href', '#paw');
    print.setAttribute('transform', 'translate(' + x + ' ' + (step % 2 ? 14 : 17) +
      ') scale(' + (leftward ? -1 : 1) + ' 1)');
    print.addEventListener('animationend', () => print.remove(), { once: true });
    pawTrail.appendChild(print);
  }

  let frameTimer = null;
  let shownFrame = null;

  function showFrame(name) {
    if (name === shownFrame) return;
    shownFrame = name;
    Object.values(frameEls).forEach(el => { el.style.display = 'none'; });
    frameEls[name].style.display = '';
  }

  function setState(name) {
    const st = STATES[name];
    clearTimeout(frameTimer);
    Object.values(STATE_CLASS).forEach(c => cat.classList.remove('cat--' + c));
    if (STATE_CLASS[name]) cat.classList.add('cat--' + STATE_CLASS[name]);
    let i = 0;
    (function step() {
      const idx = i % st.frames.length;
      showFrame(st.frames[idx]);
      if (i > 0 && (name === 'walk' || name === 'run' || name === 'crouch')) {
        leavePawPrint(i);
      }
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
    if (dist < 1) {
      setState('stand');
      return;
    }
    const speed = state === 'run' ? 0.42 : state === 'crouch' ? 0.09 : 0.14; // px за мс
    setState(state || 'walk');
    await tween(cat, { left: x, top: feetY - H }, dist / speed, 'linear');
    setPos(x, feetY);
    setState('stand');
  }

  function jumpArc(toX, toFeetY, height, dur) {
    return new Promise(resolve => {
      const fromX = px, fromY = pfeet;
      if (toX !== fromX) face(toX < fromX ? 'left' : 'right');
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

  /* ═══ Снежинка ═══ */

  const flake = { x: 0, y: 0, frame: 0, flap: null };

  function flakeShow(x, y) {
    flake.x = x; flake.y = y;
    flakeEl.style.left = x + 'px';
    flakeEl.style.top = y + 'px';
    flakeEl.style.display = '';
    clearInterval(flake.flap);
    flake.frame = 0;
    flakeFrames[0].style.display = '';
    flakeFrames[1].style.display = 'none';
    flake.flap = setInterval(() => {
      flake.frame = 1 - flake.frame;
      flakeFrames[0].style.display = flake.frame ? 'none' : '';
      flakeFrames[1].style.display = flake.frame ? '' : 'none';
    }, 120);
  }

  function flakeHide() {
    flakeEl.style.display = 'none';
    clearInterval(flake.flap);
  }

  // Полёт с лёгкой синусоидой
  function flakeTo(x, y, dur, wobble) {
    const amp = wobble === undefined ? 12 : wobble;
    return new Promise(resolve => {
      const fx = flake.x, fy = flake.y;
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = easings.ease(t);
        flake.x = fx + (x - fx) * e;
        flake.y = fy + (y - fy) * e + Math.sin(t * Math.PI * 4) * amp * (1 - t);
        flakeEl.style.left = flake.x + 'px';
        flakeEl.style.top = flake.y + 'px';
        t < 1 ? requestAnimationFrame(tick) : resolve();
      })(performance.now());
    });
  }

  // В сидячей позе голова начинается в четвёртом столбце спрайта.
  function seatedNose() {
    const offset = 10.5 * SCALE;
    return {
      x: px + (cat.classList.contains('flip') ? W - offset : offset),
      y: pfeet - H + (HAT_SPACE + 7.5) * SCALE,
    };
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
    mugEl.style.top = '106px';
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

  async function snowflakeHunt() {
    await move(100, ROOF);
    flakeShow(440, -130);
    setState('sit');
    await flakeTo(350, -85, 1800);
    await emote('!', 650);
    await move(195, ROOF, 'crouch');
    const flight = flakeTo(480, -145, 850);
    await jumpArc(282, ROOF, 43, 620);
    setState('sit');
    await flight;
    await emote('?', 700);

    const nose = seatedNose();
    await flakeTo(nose.x - 13, nose.y - 13, 1400, 5);
    await delay(1050);
    await flakeTo(RIGHT + W, -110, 1200);
    flakeHide();
  }

  async function laserChase() {
    await move(280, ROOF);
    laserShow(94, ROOF - 12);
    setState('sit');
    face('left');
    await emote('!', 700);

    // Лапы и точка встречаются с учётом направления прыжка.
    for (const spot of [94, 482, 256]) {
      laserMove(spot, ROOF - 12);
      const rightward = spot > px + W / 2;
      const landing = spot - (rightward ? W - 28 : 28);
      await move(landing + (rightward ? -52 : 52), ROOF, 'run');
      await jumpArc(landing, ROOF, 25, 310);
      setState('crouchStill');
      await delay(460);
    }
    laserHide();
    setState('sit');
    await emote('?', 950);
  }

  async function mugHeist() {
    mugShow(CARD_W - 50, ROOF - 24);
    await move(340, ROOF);
    setState('sit');
    face('right');
    await emote('!', 750);
    await move(RIGHT, ROOF, 'crouch');
    setState('crouchStill');
    await mugNudge(-9, 8);
    await delay(420);
    await mugNudge(-17, 14);
    await mugFall();
    setState('sit');
    await emote('heart', 1200);
    await mugHideSoft();
  }

  async function catNap() {
    await move(LEFT, ROOF);
    face('right');
    setState('stretch');
    await delay(1300);
    setState('groom');
    await delay(2400);
    setState('sleep');
    zzzShow();
    await delay(5200);
    zzzHide();
    setState('stretch');
    await delay(1200);
  }

  /* ═══ Цикл жизни ═══ */

  const scenarios = [snowflakeHunt, laserChase, mugHeist, catNap];
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
    setState('sit');
    face(px > CARD_W / 2 ? 'left' : 'right');
    await delay(forced >= 0 ? 2000 : 14000 + Math.random() * 8000);
    cycle();
  }

  setPos(LEFT, ROOF);
  setState('sit');
  setTimeout(cycle, 1500);
})();
