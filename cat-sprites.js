/* Спрайты кота на сетке 32×29. Каждый символ задаёт цвет одного пикселя. */
const catSprites = (() => {
  'use strict';

  const HAT_SPACE = 5;
  const GRID_W = 32, GRID_H = 24 + HAT_SPACE;

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
    R: '#d9534a', // колпак и нить
  };

  /* ═══ Детали спрайта ═══ */

  // Отворот, выступающее ухо и лоб нарисованы вместе для каждого ракурса.
  const FRONT_CAP = [
    '.......CCCCC.....',
    '.....CCRRRRRCC...',
    '...CCRRRRRRRRC..O',
    '..CRRRCCRRRRRCOBO',
    '.CRRCCCRRRRRCOPPO',
    '.WICCCRRRRRCOBPBO',
    'IWWI.CRRRWWWOBPBO',
    '.II.OIWWWWWWWIBBO',
    '...OBIWWWWWIISBBO',
    '..OBBBIIISBSBBBBO',
  ];

  const FRONT_MUZZLE = [
    '..OSBBLLBPBLLBBSO',
    '...OBLLLLOLLLLBO.',
    '....OBBLLLLLBBO..',
    '.....OOSLLLSOO...',
    '.......OSLSO.....',
  ];

  const HEAD = [
    ...FRONT_CAP,
    '..OSBEWBBBBBEWBSO',
    '..OBBEEBBBBBEEBBO',
    ...FRONT_MUZZLE,
  ];

  const HEAD_CLOSED = [
    ...FRONT_CAP,
    '..OSBBBBBBBBBBBSO',
    '..OBBEEBBBBBEEBBO',
    ...FRONT_MUZZLE,
  ];

  const SIDE_CAP = [
    '......CCCCC......',
    '....CCRRRRRCC....',
    '..CCRRRRRRRRC..O.',
    '.CRRRCCRRRRRCOBO.',
    '.CRCCCRRRRRCOPPO.',
    '.WICCRRRRRCOBPBO.',
    'IWWICRRRWWWOBPBO.',
    '.IIOIWWWWWWWIBBO.',
    '...OIWWWWWIISBBO.',
  ];

  const SIDE_MUZZLE = [
    '...OBBBLLLBLLLBPO',
    '...OSBLLLLLLLLOO.',
    '....OBBLLLLLLLO..',
    '.....OOSLLSBOO...',
    '.......OSSBO.....',
  ];

  const HEAD_SIDE = [
    ...SIDE_CAP,
    '..OBBIIISBBSBBBBO',
    '..OSBBBBBEWBBBEBO',
    '..OBSSBBBEEBBBEO.',
    ...SIDE_MUZZLE,
  ];

  const HEAD_ASLEEP = [
    ...SIDE_CAP,
    '..OBBIIISBBSBBBBO',
    '..OSBBBBBBBBBBBO.',
    '..OBSSBBEEEBBEEO.',
    ...SIDE_MUZZLE,
  ];

  // Кот тянет за нить: край опускается на глаза и затем приподнимается лапой.
  const HEAD_HAT_DOWN = [
    '.................',
    '........CCCCC....',
    '......CCRRRRRCC..',
    '....CCRRRRRRRRCO.',
    '...CRRRCCRRRRROBO',
    '..CRRCCCRRRRRCOPO',
    '..CRCCRRRRRRRCOBO',
    '..WICRRRRRRRRRCBO',
    '.IWWICRRRRRRRRCCO',
    '..IICWWRRRRRRWWIO',
    '...OIWWWWWWWWWWIO',
    '..OBIIWWWWWWWIIIO',
    ...FRONT_MUZZLE,
  ];

  const HEAD_HAT_LIFT = [
    '.................',
    '.......CCCCC.....',
    '.....CCRRRRRCC..O',
    '...CCRRRRRRRRCOBO',
    '..CRRRCCRRRRRCBPO',
    '.CRRCCCRRRRRCOPBO',
    '.WICCCRRRRRRCCBBO',
    'IWWICRRRRRRWWIIBO',
    '.II.OIWWWWWWWWIBO',
    '...OBIWWWWWWWISBO',
    '..OBBBIIIISIIBBBO',
    '..OBBEEBBBBBEEBBO',
    ...FRONT_MUZZLE,
  ];

  const BODY_SIDE = [
    '....OOOOOOO......OOOO',
    '..OOBBBSSBBOOOOOOBBLLO',
    '.OBBSBBSBBBBSSBBBBBLLLO',
    'OBBBBSSBBBBBBSBBBBBLLLO',
    'OBBBBBBBBBBBBBBBBBLLLLO',
    'OBBBBBBSBBBBBBBBBLLLLSO',
    '.OBBBBBBSBBSSLLLLLLLBO',
    '..OBBBSBSOOOOOOOOOBBO',
  ];

  const BODY_LOW = [
    '....OOOOOO.......OOO',
    '..OOBBSSBBOOOOOOOBBLO',
    '.OBSBBBSBBBBSSBBBBBLLO',
    'OBBBSBBBBBBBBSBBBBLLLLO',
    'OBBBBBBSBBBBBBBBBLLLLLO',
    '.OBBBBBBSSBBBSSLLLLBBO',
    '..OBSSSSSOOOOOOOOBBBO',
  ];

  const LEGS_STAND = [
    '.OBBBOOSSO.....OSSOBBBO',
    '.OBBBOOSSO.....OSSOBBO',
    '..OBBO.OSO.....OSOOBBO',
    '..OBO..OSSO....OSSOBO',
    '..OLLO.OOOO....OOOOLLO',
    '..OOOO............OOOO',
  ];

  // Ближняя передняя лапа тянется вперёд, задняя отталкивается.
  const LEGS_WALK_A = [
    '..OBBBOSSO......OSOBBBO',
    '.OBBBO.OSSO....OSSOOBBO',
    '.OBBO...OSSO..OSSO..OBBO',
    'OBBO....OOOO..OOOO...OBBO',
    'OLLO..................OLLO',
    'OOOO..................OOOO',
  ];

  // Во второй фазе ближние лапы проходят под животом.
  const LEGS_WALK_B = [
    '..OBBBO...........OBBBO',
    '.OSOBBBO.........OBBBOO',
    '.OSOOBBO........OBBBOSSO',
    'OSSO.OBBO......OBBBO.OSSO',
    'OOOO..OLLO....OLLO...OOOO',
    '......OOOO....OOOO',
  ];

  const LEGS_FOLDED = [
    '.OBBBSSSO........OBBBSO',
    '..OBBLLLO........OBBLLO',
    '...OOOOOO........OOOOOO',
  ];

  const LEGS_POUNCE = [
    '..OBBBSSO.......OSOBBBSO',
    '.OBBBSOSSO.......OSOBBBBO',
    'OBBBOO.OOOO.......OOOOBBBOO',
    'OLLO.................OOBBLLO',
    'OOO....................OOOOO',
  ];

  const TAIL_UP = [
    '..OOO',
    '.OLLLO',
    'OLLOO',
    'OSSO',
    'OBBO',
    'OBBSO',
    '.OBBBO',
    '..OSBBO',
    '...OSBBO',
  ];

  const TAIL_UP2 = [
    '...OOO',
    '..OLLLO',
    '.OLLOO',
    '.OSSO',
    'OBBBO',
    'OBBO',
    'OBBSO',
    '.OBBBO',
    '..OSBBBO',
  ];

  const TAIL_SIT = [
    '.OOO...........',
    'OSSBO..........',
    'OBSBO..........',
    'OBBSBO.........',
    '.OBBSBO..OOOO..',
    '..OBBBSSSBLLLO.',
    '...OOOOOOOOOO..',
  ];

  const SIT_BODY = [
    '.........OOOOO.....',
    '.......OOBBLLLO....',
    '......OBBBLLLLLO...',
    '.....OBBBBLLLLLO...',
    '....OSSBBBLLLLLBO..',
    '...OBBSSBBBLLLSBBO.',
    '..OBBBBBBBBSLLSBBO.',
    '.OBSSBBBBBBBLBSBBO.',
    'OBBBBSSBBBBBBBSBBO.',
    'OBBBBBBSSBBBBSBSBO.',
    'OBBBBBBBBSBBBSBSBO.',
    'OBBBBBBBBBSBBSBSBO.',
    '.OBBBBBBBSSBBOSBBO.',
    '..OSBBBSSOBLLOOLLO.',
    '...OOOOOOOOOOOOOOO.',
  ];

  const GROOM_BODY = [
    ...SIT_BODY.slice(0, 7),
    '.OBSSBBBBBBBLBSBO..',
    'OBBBBSSBBBBBBBSBO..',
    'OBBBBBBSSBBBBSBO...',
    'OBBBBBBBBSBBBSBO...',
    'OBBBBBBBBBSBBSBO...',
    '.OBBBBBBBSSBBSBO...',
    '..OSBBBSSOBBLLOO...',
    '...OOOOOOOOOOOO....',
  ];

  const PAW_UP = [
    '.OO..',
    'OLLO.',
    'OLLO.',
    '.OBBO',
    '.OBBO',
    '.OSBO',
    '.OBBO',
    '..OO.',
  ];

  const SLEEP_BODY = [
    '.......OOOOOOO.........',
    '.....OOBBSBBSBOO.......',
    '...OOBBBSSBBBSSBOO.....',
    '..OBBBBSSBBBBBSSBBO....',
    '.OBBBBSSBBBBBBBBBBBO...',
    '.OBBBBBBBBBBBSSBBBBBO..',
    'OBBBBBBSSBBBBBSSBBBBBO.',
    'OBBBBBBBBSSBBBBBBBLLLBO',
    'OBBBBBBBBBBBBBBLLLLLLBO',
    '.OBBBBBBBBBBSBLLLLLLBO.',
    '..OOSBBBBBBSSBBLLLBOO..',
    '....OOOOOOOOOOOOOOO....',
  ];

  const SLEEP_TAIL = [
    '.OO....................',
    'OSSBO................OOO.',
    'OBSBO...............OLLLO',
    'OBBSBO............OBLLLO.',
    '.OBBSBO.........OOSBBBO..',
    '..OBBSBOO....OOOSBBBBO...',
    '...OBBBSSOOOOSBBBBBO.....',
    '....OBBBSSBBBSBBOO.....',
    '.....OOOOOOOOOOO.......',
  ];

  const STRETCH_BODY = [
    '....OOOOO',
    '..OOBBSBBO',
    '.OBBSBBSBBOO',
    '.OBBBSBBBBBBOO',
    '.OBBBBBBSBBBBBOOO',
    '.OBBBBBBSSBBBBBBBOO',
    '..OBBBBBBSBBBBBBBBLO',
    '..OBBBOSSSOBBBBBBLLLO',
    '..OBBO.OSSOOOSBLLLLLO',
    '..OBO..OSO...OOBBLLO',
    '.OBLO..OSSO....OBBLO',
    '.OOOO..OOOO.....OOOO',
  ];

  const FRONT_FLAT = [
    'OSSOSSSSSSOOO',
    'OBBBBBBBOOOLLO',
    '.OOOOOOOOOOOOO',
  ];

  /* ═══ Сборка кадров ═══ */

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

  // Привязка головы к позе: помпон выступает на 2 пикселя влево, верх на 4 вверх.
  function headAt(art, x, y) {
    return [art, x - 2, y - 4];
  }

  function makeFrame(name, parts) {
    const grid = Array.from({ length: GRID_H }, () => Array(GRID_W).fill('.'));
    for (const [art, x, y] of parts) stamp(grid, art, x, y + HAT_SPACE);
    FRAMES[name] = grid.map(row => row.join(''));
  }

  // Стоит / идёт (мордой вправо)
  makeFrame('stand', [
    [TAIL_UP, 0, 6], [BODY_SIDE, 3, 11], [LEGS_STAND, 3, 18], headAt(HEAD_SIDE, 17, 1),
  ]);
  makeFrame('walk1', [
    [TAIL_UP, 0, 6], [BODY_SIDE, 3, 11], [LEGS_WALK_A, 3, 18], headAt(HEAD_SIDE, 17, 1),
  ]);
  makeFrame('walk2', [
    [TAIL_UP2, 0, 6], [BODY_SIDE, 3, 11], [LEGS_WALK_B, 3, 18], headAt(HEAD_SIDE, 17, 1),
  ]);

  // Сидит
  makeFrame('sit', [
    [SIT_BODY, 3, 9], [TAIL_SIT, 0, 17], headAt(HEAD, 7, 0),
  ]);
  makeFrame('sit-blink', [
    [SIT_BODY, 3, 9], [TAIL_SIT, 0, 17], headAt(HEAD_CLOSED, 7, 0),
  ]);

  // Умывается
  const SEATED = [[GROOM_BODY, 3, 9], [TAIL_SIT, 0, 17]];
  makeFrame('groom1', [
    ...SEATED, headAt(HEAD, 7, 0), [PAW_UP, 16, 8],
  ]);
  makeFrame('groom2', [
    ...SEATED, headAt(HEAD_CLOSED, 7, 0), [PAW_UP, 17, 10],
  ]);

  // Спит клубком
  makeFrame('sleep', [
    [SLEEP_BODY, 2, 12], headAt(HEAD_ASLEEP, 13, 7), [SLEEP_TAIL, 3, 15],
  ]);

  // Крадётся / готовится к прыжку
  makeFrame('crouch1', [
    [TAIL_UP, 0, 9], [BODY_LOW, 3, 16], [LEGS_FOLDED, 3, 21], headAt(HEAD_SIDE, 17, 8),
  ]);
  makeFrame('crouch2', [
    [TAIL_UP2, 0, 9], [BODY_LOW, 3, 16], [LEGS_FOLDED, 3, 21], headAt(HEAD_SIDE, 17, 8),
  ]);

  // Прыжок
  makeFrame('pounce', [
    [TAIL_UP2, 0, 4], [BODY_SIDE, 3, 10], [LEGS_POUNCE, 3, 17], headAt(HEAD_SIDE, 17, 0),
  ]);

  // Потягивается
  makeFrame('stretch', [
    [TAIL_UP, 0, 6], [STRETCH_BODY, 1, 12], headAt(HEAD_SIDE, 16, 9), [FRONT_FLAT, 17, 21],
  ]);

  // Локальные кадры зимних сцен. Реквизит в лапах движется вместе со спрайтом.
  const REACH = ['..OOOOOOO', '.OBBBLLLO', 'OBBBBOOO.', '.OOO.....'];
  const SNOW = ['..III..', '.IWWWI.', 'IWWWWWI', 'IWWWWWI', '.IIWWI.', '..IIII.'];
  const SCOOP_POSE = [...SEATED, headAt(HEAD_SIDE, 9, 3), [REACH, 16, 18]];
  const SCOOP_SNOW = [SNOW, 22, 18];
  makeFrame('return-gather', SCOOP_POSE);
  makeFrame('scoop-out', [...SCOOP_POSE, SCOOP_SNOW]);
  makeFrame('scoop-in', [...SEATED, headAt(HEAD_SIDE, 8, 2), [REACH, 15, 16], [SNOW, 19, 17]]);
  makeFrame('scoop-lift', [...SEATED, headAt(HEAD, 7, 0), [PAW_UP, 16, 11], [SNOW, 14, 11]]);
  makeFrame('snow-nose', [...SEATED, headAt(HEAD, 7, 0), [SNOW, 11, 6]]);
  makeFrame('sneeze', [...SEATED, headAt(HEAD_CLOSED, 9, 3), [REACH, 15, 13]]);

  const WINDUP_PAW = [
    '.OO......', 'OLLO.....', '.OLLO....', '..OBBO...', '...OBBO..',
    '....OBBO.', '.....OBBO', '......OOO',
  ];
  const SWING_PAW = [
    '........OOO', '.......OLLO', '......OLLO.', '.....OBBO..',
    '....OBBO...', '...OBBO....', '..OSBO.....', '.OBBO......', '.OOO.......',
  ];
  const THROW_SNOW = [SNOW, 24, 5];
  const THROW_POSE = [...SEATED, headAt(HEAD_SIDE, 8, 0), [SWING_PAW, 15, 10]];
  makeFrame('return-windup', [...SEATED, headAt(HEAD_SIDE, 7, 2), [WINDUP_PAW, 9, 10], [SNOW, 5, 5]]);
  makeFrame('return-aim', [...THROW_POSE, THROW_SNOW]);
  makeFrame('return-release', THROW_POSE);

  // Нить выходит из-под помпона, свободный конец ложится поперёк поднятой лапы.
  const THREAD = [
    '..RR', '.RR.', 'RR..', 'RR..', '.RR.', '..RR', '...RR',
    '....RR', '.....RR', '......RR', '.......RR', '........RR',
    '.........RR', '..........RR', '...........RR', '............RR',
  ];
  makeFrame('loose-end', [...SEATED, headAt(HEAD, 7, 0), [THREAD.slice(0, 7), 3, 3]]);
  makeFrame('long-end', [...SEATED, headAt(HEAD, 7, 0), [THREAD, 3, 3]]);
  makeFrame('catch-yarn', [...SEATED, headAt(HEAD, 7, 0), [THREAD, 3, 3], [PAW_UP, 13, 14]]);
  makeFrame('hat-down', [...SEATED, headAt(HEAD_HAT_DOWN, 7, 0), [THREAD.slice(0, 12), 4, 6], [PAW_UP, 11, 14]]);
  makeFrame('hat-lift', [...SEATED, headAt(HEAD_HAT_LIFT, 7, 0), [PAW_UP, 13, 5]]);

  /* ═══ Реквизит ═══ */

  const FLAKE_A = [
    '....W....', '.I..W..I.', '..W.W.W..', '...WWW...',
    'IIWWWWWII', '...WWW...', '..W.W.W..', '.I..W..I.', '....W....',
  ];
  const FLAKE_B = [
    '...W...', '.I.W.I.', '..WWW..', 'IIWWWII', '..WWW..', '.I.W.I.', '...W...',
  ];

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

  return { GRID_W, GRID_H, HAT_SPACE, FRAMES, FLAKE_A, FLAKE_B, SNOW, SCOOP_SNOW, THROW_SNOW, svgFromGrid };
})();
