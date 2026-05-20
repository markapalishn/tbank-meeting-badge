(function () {
  const CARD_W = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-width'));
  const CARD_H = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-height'));
  const PAD = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--screen-padding'));
  const W = 146, H = 104;
  const TOP_Y = PAD + 4;
  const BOT_Y = PAD + CARD_H + 30 - H - 4;

  const capy = document.querySelector('.capybara');
  const mug = capy.querySelector('.capybara__mug');
  const allSvgs = capy.querySelectorAll('svg[class^="capybara__svg--"]');

  const easings = {
    linear: t => t,
    ease: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: t => t * (2 - t),
    easeIn: t => t * t,
  };

  /* ── Утилиты ── */

  function show(state) {
    allSvgs.forEach(s => { s.style.display = 'none'; });
    const active = capy.querySelector('.capybara__svg--' + state);
    if (active) active.style.display = '';
    ['walking', 'sleeping', 'eating', 'sniffing', 'sitting'].forEach(c =>
      capy.classList.remove('capybara--' + c)
    );
    const classMap = { walk: 'walking', sleep: 'sleeping', eat: 'eating', sniff: 'sniffing', sit: 'sitting' };
    if (classMap[state]) capy.classList.add('capybara--' + classMap[state]);
  }

  function setPos(x, y) {
    capy.style.left = x + 'px';
    capy.style.top = y + 'px';
  }

  function getPos() {
    return { x: parseFloat(capy.style.left) || 0, y: parseFloat(capy.style.top) || 0 };
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function face(dir) {
    capy.style.transform = dir === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function animate(props, duration, easing) {
    return new Promise(resolve => {
      const start = performance.now();
      const from = {};
      for (const k in props) from[k] = parseFloat(capy.style[k]) || 0;
      const ease = easings[easing] || easings.linear;
      (function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const e = ease(t);
        for (const k in props) {
          let val = from[k] + (props[k] - from[k]) * e;
          if (k === 'left') val = clamp(val, 0, CARD_W - W);
          if (k === 'top') val = clamp(val, TOP_Y, BOT_Y);
          capy.style[k] = val + 'px';
        }
        t < 1 ? requestAnimationFrame(tick) : resolve();
      })(performance.now());
    });
  }

  async function hops(startX, startY, endX, count) {
    const dx = (endX - startX) / count;
    setPos(startX, startY);
    for (let i = 0; i < count; i++) {
      await animate({ left: startX + dx * (i + 0.5), top: startY - 14 }, 120, 'easeOut');
      await animate({ left: startX + dx * (i + 1), top: startY }, 120, 'easeIn');
    }
  }

  async function hopIn(toX, toY) {
    face('right');
    capy.style.zIndex = 10;
    show('walk');
    await hops(toX - W, toY, toX, 3);
  }

  async function hopAway() {
    show('walk');
    const { x, y } = getPos();
    const dir = capy.style.transform === 'scaleX(-1)' ? -1 : 1;
    await hops(x, y, x + dir * (W + 40), 4);
  }

  async function walkTo(toX, toY, dur) {
    show('walk');
    await animate({ left: toX, top: toY }, dur, 'linear');
  }

  async function jump(dy, dur) {
    const { y } = getPos();
    await animate({ top: y - dy }, dur * 0.5, 'easeOut');
    await animate({ top: y }, dur * 0.5, 'easeIn');
  }

  async function happyBounce(count) {
    show('walk');
    for (let i = 0; i < count; i++) {
      await jump(18, 300);
      await delay(100);
    }
  }

  function showMug(visible) {
    mug.style.display = visible ? '' : 'none';
  }

  async function mugFall() {
    mug.style.display = '';
    mug.style.transition = 'top 0.4s ease-in, opacity 0.4s';
    mug.style.top = '60px';
    mug.style.opacity = '0';
    await delay(500);
    mug.style.transition = '';
    mug.style.top = '';
    mug.style.opacity = '';
    mug.style.display = 'none';
  }

  /* ── Сценарий 1: Исследователь ── */

  async function explorer() {
    await hopIn(0, TOP_Y);

    // Бежит к логотипу
    await walkTo(70, TOP_Y, 2000);

    // Обнюхивает логотип
    show('sniff');
    await delay(600);
    await jump(4, 300);
    await delay(600);
    await jump(3, 250);
    await delay(400);

    // Запрыгивает на блок с именем
    show('walk');
    face('right');
    await animate({ left: 110, top: TOP_Y - 12 }, 300, 'easeOut');
    await animate({ top: TOP_Y }, 200, 'easeIn');

    // Пробегает по блоку
    capy.style.zIndex = 1;
    await walkTo(CARD_W - W - 10, TOP_Y, 2200);
    capy.style.zIndex = 10;

    // Спрыгивает к тексту
    await animate({ top: BOT_Y - 10 }, 200, 'easeOut');
    await animate({ left: CARD_W - W, top: BOT_Y }, 200, 'easeIn');

    // Садится и «читает»
    show('sit');
    face('left');
    await delay(3000);

    // Убегает
    await hopAway();
    await delay(500);
  }

  /* ── Сценарий 3: Обед ── */

  async function lunch() {
    await hopIn(0, TOP_Y);

    // Бежит вправо по верху
    await walkTo(CARD_W - W, TOP_Y, 3000);

    // Спускается
    await walkTo(CARD_W - W, BOT_Y, 1600);

    // Ест
    show('eat');
    await delay(3500);

    // Довольна — прыжки
    await happyBounce(3);

    // Бежит влево
    face('left');
    await walkTo(0, BOT_Y, 3000);

    // Засыпает с полным животом
    show('sleep');
    await delay(4000);

    // Просыпается и упрыгивает
    await hopAway();
    await delay(500);
  }

  /* ── Сценарий 5: Рабочий день ── */

  async function workday() {
    // Впрыгивает с кружкой
    showMug(true);
    await hopIn(0, TOP_Y);

    // Бежит к блоку с именем
    await walkTo(100, TOP_Y, 2000);

    // Забегает за блок (на работу)
    capy.style.zIndex = 1;
    await animate({ left: CARD_W / 2 - W / 2, top: 25 }, 1000, 'ease');

    // Садится работать
    show('sit');
    showMug(true);
    await delay(3000);

    // Устаёт, засыпает, кружка падает
    show('sleep');
    await delay(1000);
    await mugFall();
    await delay(2500);

    // Просыпается с испугом — большой прыжок
    show('walk');
    capy.style.zIndex = 10;
    await animate({ top: -10 }, 200, 'easeOut');
    await animate({ left: CARD_W - W, top: TOP_Y }, 400, 'easeOut');
    await delay(200);

    // Убегает вправо
    face('right');
    await hopAway();
    await delay(500);
  }

  /* ── Цикл ── */

  const scenarios = [explorer, lunch, workday];
  let lastIdx = -1;

  async function cycle() {
    let idx;
    do { idx = Math.floor(Math.random() * scenarios.length); } while (idx === lastIdx);
    lastIdx = idx;
    setPos(-W, TOP_Y);
    await scenarios[idx]();
    await delay(20000);
    cycle();
  }

  capy.style.position = 'absolute';
  setPos(-W, TOP_Y);
  cycle();
})();
