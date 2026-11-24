/* Движение кота и сцены бейджа для OBS. */
(function () {
  'use strict';

  const {
    GRID_W, GRID_H, HAT_SPACE, FRAMES, FLAKE_A, FLAKE_B, SNOW, SCOOP_SNOW, THROW_SNOW, svgFromGrid,
  } = catSprites;
  const css = getComputedStyle(document.documentElement);
  const CARD_W = parseInt(css.getPropertyValue('--card-width')) || 690;
  const SCALE = 4;
  const W = GRID_W * SCALE, H = GRID_H * SCALE;
  const ROOF = -4;
  const LEFT = 26;
  const RIGHT = CARD_W - W - 24;

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
  for (const [name, rows] of Object.entries(FRAMES)) {
    const svg = svgFromGrid(rows);
    svg.classList.add('cat__frame');
    svg.style.display = 'none';
    cat.appendChild(svg);
    frameEls[name] = svg;
  }

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

  /* ═══ Анимационные утилиты ═══ */

  function place(el, x, y) {
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }

  const linear = t => t;
  const easeIn = t => t * t;
  const easeOut = t => t * (2 - t);
  const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  function animate(duration, draw) {
    return new Promise(resolve => {
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        draw(t);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      tick(start);
    });
  }

  function tween(el, to, duration, ease = linear) {
    const from = {};
    for (const key in to) from[key] = parseFloat(el.style[key]) || 0;
    return animate(duration, t => {
      const progress = ease(t);
      for (const key in to) el.style[key] = from[key] + (to[key] - from[key]) * progress + 'px';
    });
  }

  /* ═══ Кот: состояние и движение ═══ */

  let px = LEFT, pfeet = ROOF;

  function setPos(x, feetY) {
    px = x; pfeet = feetY;
    place(cat, x, feetY - H);
  }

  function face(dir) {
    cat.classList.toggle('flip', dir === 'left');
  }

  const STATES = {
    stand:       { frames: ['stand'] },
    walk:        { frames: ['walk1', 'walk2'], ms: 170, motion: 'cat--walking' },
    run:         { frames: ['walk1', 'walk2'], ms: 95, motion: 'cat--walking' },
    sit:         { frames: ['sit', 'sit-blink'], durations: [2300, 140] },
    groom:       { frames: ['groom1', 'groom2'], ms: 300, motion: 'cat--grooming' },
    sleep:       { frames: ['sleep'], motion: 'cat--sleeping' },
    crouch:      { frames: ['crouch1', 'crouch2'], ms: 340 },
    crouchStill: { frames: ['crouch1'] },
    pounce:      { frames: ['pounce'] },
    stretch:     { frames: ['stretch'] },
  };

  let frameTimer;
  let motionClass;
  let shownFrame;

  function showFrame(name) {
    const frame = frameEls[name];
    if (frame === shownFrame) return;
    if (shownFrame) shownFrame.style.display = 'none';
    frame.style.display = '';
    shownFrame = frame;
  }

  function stopState() {
    clearTimeout(frameTimer);
    if (motionClass) cat.classList.remove(motionClass);
    motionClass = null;
  }

  function setState(name) {
    stopState();
    const state = STATES[name];
    motionClass = state.motion;
    if (motionClass) cat.classList.add(motionClass);
    function step(index) {
      showFrame(state.frames[index]);
      if (state.frames.length > 1) {
        const ms = state.durations ? state.durations[index] : state.ms;
        frameTimer = setTimeout(step, ms, (index + 1) % state.frames.length);
      }
    }
    step(0);
  }

  // Координаты левого края спрайта на каждой плашке до масштабирования OBS.
  const perches = Array.from(document.querySelector('.employee-card__top').children, tile => {
    const inset = 18;
    return { left: tile.offsetLeft + inset, right: tile.offsetLeft + tile.offsetWidth - W - inset };
  });

  function supportedX(x, perch) {
    return Math.max(perch.left, Math.min(x, perch.right));
  }

  function nearestPerch(x) {
    const [logo, name] = perches;
    return x <= (logo.right + name.left) / 2 ? logo : name;
  }

  async function walkTo(x, state) {
    const dx = x - px;
    if (Math.abs(dx) < 1) return;
    face(dx < 0 ? 'left' : 'right');
    const speed = state === 'run' ? 0.42 : state === 'crouch' ? 0.09 : 0.14;
    setState(state);
    await tween(cat, { left: x }, Math.abs(dx) / speed);
    setPos(x, ROOF);
  }

  async function move(x, state = 'walk') {
    const from = nearestPerch(px);
    const to = nearestPerch(x);
    if (from !== to) {
      const rightward = to.left > from.left;
      await walkTo(rightward ? from.right : from.left, state);
      face(rightward ? 'right' : 'left');
      setState('crouchStill');
      await delay(140);
      await jumpArc(rightward ? to.left : to.right, 48, 520);
      setState('crouchStill');
      await delay(100);
    }
    await walkTo(supportedX(x, to), state);
    setState('stand');
  }

  function scatterLandingSnow() {
    const facing = cat.classList.contains('flip') ? -1 : 1;
    const spray = [];
    // Центры стоп в нижней строке спрайта pounce.
    for (const [column, outward] of [[4.5, -1], [28.5, 1]]) {
      const pawX = px + (facing === 1 ? column * SCALE : W - column * SCALE);
      for (const [size, reach, lift, duration] of [[5, 58, 25, 500], [4, 38, 42, 600], [3, 24, 18, 400]]) {
        const bit = winterProp(['.W.', 'WWW', '.II'], size, pawX - size * 1.5, ROOF - size * 3);
        spray.push({ bit, dx: outward * facing * reach, lift, duration });
      }
    }

    const start = performance.now();
    function tick(now) {
      let active = false;
      for (const { bit, dx, lift, duration } of spray) {
        const t = Math.min((now - start) / duration, 1);
        if (t === 1) {
          bit.remove();
          continue;
        }
        active = true;
        const rise = -4 * lift * t * (1 - t);
        bit.style.transform = `translate(${dx * t}px, ${rise}px)`;
        bit.style.opacity = Math.min(1, (1 - t) * 3);
      }
      if (active) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function jumpArc(x, height, duration) {
    const fromX = px;
    const toX = supportedX(x, nearestPerch(x));
    if (toX !== fromX) face(toX < fromX ? 'left' : 'right');
    setState('pounce');
    return animate(duration, t => {
      setPos(fromX + (toX - fromX) * t, ROOF - height * 4 * t * (1 - t));
      if (t === 1) scatterLandingSnow();
    });
  }

  /* ═══ Снежинка ═══ */

  let flakeTimer;
  function flakeShow(x, y) {
    place(flakeEl, x, y);
    flakeEl.style.display = '';
    clearInterval(flakeTimer);
    let frame = 0;
    function flap() {
      flakeFrames[frame].style.display = '';
      frame = 1 - frame;
      flakeFrames[frame].style.display = 'none';
    }
    flap();
    flakeTimer = setInterval(flap, 120);
  }

  function flakeTo(x, y, duration, wobble = 12) {
    const fromX = parseFloat(flakeEl.style.left);
    const fromY = parseFloat(flakeEl.style.top);
    return animate(duration, t => {
      const progress = easeInOut(t);
      const offsetY = Math.sin(t * Math.PI * 4) * wobble * (1 - t);
      place(flakeEl, fromX + (x - fromX) * progress, fromY + (y - fromY) * progress + offsetY);
    });
  }

  // Центр розового пикселя на мордочке в кадрах sit и snow-nose.
  function seatedNose() {
    const offset = 14.5 * SCALE;
    return {
      x: px + (cat.classList.contains('flip') ? W - offset : offset),
      y: pfeet - H + (HAT_SPACE + 8.5) * SCALE,
    };
  }

  /* ═══ Общие ходы ═══ */

  async function snowflakeHunt() {
    await move(LEFT);
    flakeShow(440, -130);
    setState('sit');
    await flakeTo(350, -85, 1800);
    await delay(650);
    await move(195, 'crouch');
    const flight = flakeTo(480, -145, 850);
    await jumpArc(282, 43, 620);
    setState('sit');
    await flight;
    await delay(700);

    const nose = seatedNose();
    await flakeTo(nose.x - 13, nose.y - 13, 1400, 5);
    await delay(1050);
    await flakeTo(RIGHT + W, -110, 1200);
    clearInterval(flakeTimer);
    flakeEl.style.display = 'none';
  }

  async function laserChase() {
    await move(280);
    place(laserEl, 54, ROOF - 12);
    laserEl.style.display = '';
    setState('sit');
    face('left');
    await delay(700);

    // После прыжка передняя лапа оказывается в центре лазерной точки.
    const frontPaw = 23 * SCALE; // середина стопы в кадре crouch1
    const spotRadius = laserEl.offsetWidth / 2;
    for (const spot of [54, 482, 256]) {
      place(laserEl, spot, ROOF - 12);
      const rightward = spot > px + W / 2;
      const landing = spot + spotRadius - (rightward ? frontPaw : W - frontPaw);
      await move(landing + (rightward ? -52 : 52), 'run');
      await jumpArc(landing, 25, 310);
      setState('crouchStill');
      await delay(460);
    }
    laserEl.style.display = 'none';
    setState('sit');
    await delay(950);
  }

  function pose(frame, ms) {
    stopState();
    showFrame(frame);
    return delay(ms);
  }

  function winterProp(art, scale, x, y) {
    const prop = svgFromGrid(art, scale);
    prop.classList.add('winter-prop');
    prop.setAttribute('aria-hidden', 'true');
    place(prop, x, y);
    container.appendChild(prop);
    return prop;
  }

  async function snowballSneeze() {
    await move(290);
    face('right');
    for (let scoop = 0; scoop < 2; scoop++) {
      await pose('scoop-out', 420);
      await pose('scoop-in', 360);
    }
    await pose('scoop-lift', 350);
    await pose('snow-nose', 1250);
    const nose = seatedNose();
    const spray = [25, 45, 66].map(async (distance, i) => {
      const bit = winterProp([i === 1 ? 'I' : 'W'], 7, nose.x, nose.y);
      await tween(bit, { left: nose.x + distance / 2, top: nose.y - 10 - i * 5 }, 145, easeOut);
      await tween(bit, { left: nose.x + distance, top: ROOF - 5 }, 290 + i * 80, easeIn);
      await delay(350);
      bit.remove();
    });
    await pose('sneeze', 430);
    setState('sit');
    await Promise.all(spray);
  }

  // Начало координат — левый верхний угол снежка в соответствующем кадре кота.
  function snowballFlight(ball, catX, [, column, row], outgoing) {
    const x = catX + column * SCALE;
    const y = pfeet - H + (HAT_SPACE + row) * SCALE;
    place(ball, x, y);
    const duration = outgoing ? 1220 : 1460;
    const lift = outgoing ? 164 : 130;
    return animate(duration, t => {
      const edgeFraction = outgoing ? t : 1 - t;
      // Правый край камеры в координатах бейджа, включая изменение размера OBS в полёте.
      const bounds = container.getBoundingClientRect();
      const edgeX = (innerWidth - bounds.left) * CARD_W / bounds.width + 12;
      const dx = (edgeX - x) * edgeFraction;
      const dy = 96 * edgeFraction - 4 * lift * t * (1 - t);
      ball.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
  }

  async function snowballReturn() {
    const gatherX = supportedX(RIGHT - 72, perches[1]);
    await move(gatherX - 56);
    face('right');
    setState('sit');

    const ball = winterProp(SNOW, SCALE, 0, 0);
    ball.classList.add('snowball-projectile');
    try {
      const arriving = snowballFlight(ball, gatherX, SCOOP_SNOW, false);
      await delay(790);
      setState('crouchStill');
      cat.style.zIndex = '4'; // Пригибается за снежной кромкой плашки.
      await tween(cat, { top: ROOF - H + 63 }, 190, easeIn);
      await arriving;
      ball.style.transformOrigin = 'center bottom';
      ball.style.transform = 'scale(1.4, .55)';

      const impactX = parseFloat(ball.style.left) + SNOW[0].length * SCALE / 2;
      const impactY = parseFloat(ball.style.top) + SNOW.length * SCALE;
      await Promise.all([-24, 13, 37].map(async (distance, i) => {
        const fleck = winterProp(['WI'], 3 + i % 2, impactX, impactY);
        try {
          await tween(fleck, { left: impactX + distance / 2, top: impactY - 18 - i * 5 }, 120, easeOut);
          await tween(fleck, { left: impactX + distance, top: impactY }, 160, easeIn);
        } finally {
          fleck.remove();
        }
      }));
      await tween(cat, { top: ROOF - H + 32 }, 230, easeOut);
      await delay(420);
      await tween(cat, { top: ROOF - H }, 230, easeOut);
      cat.style.removeProperty('z-index');
      await move(gatherX, 'crouch');
      face('right');

      ball.style.transition = 'transform 220ms ease-out';
      ball.style.transform = 'scale(1)';
      await pose('return-gather', 240);
      ball.style.transition = '';
      ball.style.display = 'none';
      await pose('scoop-out', 330);
      await pose('scoop-in', 310);
      await pose('scoop-out', 260);
      await pose('scoop-in', 260);
      await pose('scoop-lift', 280);
      await pose('return-windup', 420);
      await pose('return-aim', 70);

      // При отпускании тот же рисунок снега остаётся на том же пикселе лапы.
      showFrame('return-release');
      ball.style.display = '';
      const departing = snowballFlight(ball, px, THROW_SNOW, true);
      await delay(280);
      setState('stand');
      await departing;
    } finally {
      ball.remove();
      cat.style.removeProperty('z-index');
      setPos(px, ROOF);
    }
  }

  async function looseYarn() {
    await move(350);
    face('right');
    await pose('loose-end', 650);
    await pose('long-end', 720);
    await pose('catch-yarn', 560);
    await pose('hat-down', 1000);
    await pose('hat-lift', 340);
    setState('groom');
    await delay(850);
    setState('sit');
  }

  async function catNap() {
    await move(LEFT);
    face('right');
    setState('stretch');
    await delay(1300);
    setState('groom');
    await delay(2400);
    setState('sleep');
    await delay(5200);
    setState('stretch');
    await delay(1200);
  }

  /* ═══ Цикл жизни ═══ */

  const scenarios = {
    butterfly: snowflakeHunt,
    laser: laserChase,
    nap: catNap,
    snowball: snowballSneeze,
    yarn: looseYarn,
    frost: window.playFrostCorner,
    'snowball-return': snowballReturn,
  };
  const names = Object.keys(scenarios);
  const requested = new URLSearchParams(location.search).get('scenario');
  const forced = names.includes(requested) ? requested : null;

  async function cycle() {
    let previous;
    while (true) {
      let name = forced;
      if (!name) {
        do { name = names[Math.floor(Math.random() * names.length)]; } while (name === previous);
      }
      previous = name;
      window.__catScenario = name;
      await scenarios[name]();
      setState('sit');
      face(px > CARD_W / 2 ? 'left' : 'right');
      await delay(forced ? 2000 : 14000 + Math.random() * 8000);
    }
  }

  setPos(LEFT, ROOF);
  setState('sit');
  setTimeout(cycle, 1500);
})();
