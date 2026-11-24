/* Матовый лёд на прозрачном слое камеры. */
(function () {
  'use strict';

  const WIDTH = 350;
  const HEIGHT = 205;

  function clamp01(value) {
    return Math.min(1, Math.max(0, value));
  }

  function smoothstep(value) {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  }

  // Рисуем неподвижную наледь и запоминаем время появления каждой крупинки.
  function paintRimeTexture(ctx) {
    const { width, height } = ctx.canvas;
    const image = ctx.createImageData(width, height);
    const pixels = image.data;
    const arrival = new Uint8Array(width * height).fill(255);
    const dx = WIDTH / width, dy = HEIGHT / height;
    let seed = 152843;
    function random() {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    // Поля в координатах стекла сохраняют форму кромки и пор при изменении DPR.
    function noise(step) {
      const columns = Math.ceil(WIDTH / step) + 2, rows = Math.ceil(HEIGHT / step) + 2;
      const grid = Float32Array.from({ length: columns * rows }, random);
      return (x, y) => {
        const u = x / step, v = y / step, ix = Math.floor(u), iy = Math.floor(v);
        const fx = u - ix, fy = v - iy, i = iy * columns + ix;
        const sx = smoothstep(fx), sy = smoothstep(fy);
        const a = grid[i] + sx * (grid[i + 1] - grid[i]);
        const b = grid[i + columns] + sx * (grid[i + columns + 1] - grid[i + columns]);
        return a + sy * (b - a);
      };
    }
    const cloud = noise(36), drift = noise(12), rough = noise(3.9), grit = noise(1.0);

    // Неравномерные участки чистого стекла внутри льда. Их контуры искажаются зерном.
    const pores = [
      [115, 8, 6.5, 2.7, -0.25], [166, 13, 8, 4.5, 0.23], [200, 26, 14, 6.7, -0.32],
      [237, 11, 5.8, 3.1, 0.55], [251, 42, 10, 5.3, 0.4], [279, 23, 7, 6, -0.3],
      [284, 61, 5, 3.3, -0.38], [331, 104, 4.2, 6, -0.6], [333, 142, 5, 8, 0.28],
    ];
    const clearance = new Float32Array(width * height).fill(-20);
    for (const [cx, cy, rx, ry, lean] of pores) {
      const marginX = 2 * (rx + ry * Math.abs(lean)), marginY = 2 * ry;
      const x0 = Math.max(0, Math.floor((cx - marginX) / dx));
      const x1 = Math.min(width, Math.ceil((cx + marginX) / dx));
      const y0 = Math.max(0, Math.floor((cy - marginY) / dy));
      const y1 = Math.min(height, Math.ceil((cy + marginY) / dy));
      const poreRadius = Math.min(rx, ry);
      for (let j = y0; j < y1; j++) {
        const yy = (j + 0.5) * dy - cy;
        const ySquared = (yy / ry) ** 2;
        for (let i = x0; i < x1; i++) {
          const xx = ((i + 0.5) * dx - cx - yy * lean) / rx;
          const depth = (1 - xx * xx - ySquared) * poreRadius;
          const offset = j * width + i;
          clearance[offset] = Math.max(clearance[offset], depth);
        }
      }
    }

    const lip = new Float32Array(width);
    for (let i = 0; i < width; i++) {
      const x = (i + 0.5) * dx, u = x / WIDTH;
      lip[i] = -8 + 101 * u * Math.sqrt(u) + 11 * (cloud(x, 8) - 0.5);
    }
    const reliefAbove = new Float32Array(width).fill(0.5);
    for (let j = 0; j < height; j++) {
      let reliefLeft = 0.5;
      const y = (j + 0.5) * dy, v = 1 - y / HEIGHT;
      const side = -7 + 145 * v * Math.sqrt(v) + 54 * v * (1 - v) + 13 * (cloud(300, y) - 0.5);
      for (let i = 0; i < width; i++) {
        const x = (i + 0.5) * dx, k = j * width + i;
        const topDepth = lip[i] - y, sideDepth = x - WIDTH + side;
        const depth = Math.max(topDepth, sideDepth);
        if (depth < -28 || x < 5 || y > HEIGHT - 5) continue;
        const low = cloud(x, y), mid = drift(x, y), chip = rough(x, y), grain = grit(x, y);
        const relief = 0.55 * chip + 0.45 * grain;
        const slope = (relief - reliefAbove[i]) / dy + (relief - reliefLeft) / dx;
        reliefLeft = relief; reliefAbove[i] = relief;
        const breakage = (low - 0.5) * 28 + (mid - 0.5) * 16 + (chip - 0.5) * 7;
        const front = depth + breakage;
        const mist = smoothstep((front + 22) / 37);
        const crust = smoothstep((front + 2 + (chip - 0.5) * 16 + (grain - 0.5) * 8) / 25);
        const softGlass = smoothstep((mid * 0.6 + low * 0.4 - 0.52) / 0.28);
        const voidDepth = clearance[k] + (mid - 0.5) * 13 + (chip - 0.5) * 8.7 + (grain - 0.5) * 2.8;
        const compact = clamp01(0.28 + depth / 64);
        const packedRim = crust * (1 - smoothstep(Math.min(y, WIDTH - x) / 22));
        const crystal = crust * (0.24 + 0.32 * compact + 0.23 * grain + 0.14 * chip);
        const granules = mist * (1 - crust) * smoothstep((0.4 * chip + 0.6 * grain - 0.5) / 0.36);
        const edgeFade = smoothstep((x - 5) / 30) * smoothstep((HEIGHT - 5 - y) / 29);
        const opacity = clamp01(mist * 0.13 + crystal + granules * 0.40 + packedRim * 0.08) * (1 - 0.62 * softGlass) *
          (1 - smoothstep((voidDepth + 2.8) / 4.5)) * edgeFade;
        const fromTop = y / Math.max(12, lip[i] + 19) + 0.28 * (1 - x / WIDTH);
        const fromSide = (WIDTH - x) / Math.max(12, side + 19) + 0.30 * (y / HEIGHT);
        arrival[k] = 255 * clamp01(Math.min(fromTop, fromSide) * 0.89 +
          (mid - 0.5) * 0.09 + (chip - 0.5) * 0.04 + (grain - 0.5) * 0.018);
        if (opacity <= 0.002) continue;
        const shade = 186 + 23 * compact + 26 * chip + 20 * grain - 14 * softGlass + 5 * packedRim + (31 - 9 * packedRim) * slope;
        const o = k * 4;
        pixels[o] = shade; pixels[o + 1] = shade + 7; pixels[o + 2] = shade + 10;
        pixels[o + 3] = 255 * opacity;
      }
    }

    ctx.putImageData(image, 0, 0);
    ctx.scale(1 / dx, 1 / dy);
    // Местами свет ловят неровные плоские кристаллики; чистые промежутки пропускают фон камеры.
    for (let i = 0; i < 8500; i++) {
      const x = random() * WIDTH, y = random() * HEIGHT;
      const opacity = pixels[(Math.floor(y / dy) * width + Math.floor(x / dx)) * 4 + 3] / 255;
      if (opacity < 0.12 || random() > opacity + 0.15) continue;
      const r = 0.19 + 1.55 * random() ** 3;
      const skew = (random() - 0.5) * r;
      ctx.beginPath(); ctx.moveTo(x - r, y + skew); ctx.lineTo(x - 0.22 * r, y - r);
      ctx.lineTo(x + r, y - skew); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,251,' + (0.17 + random() * 0.55) + ')'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - r, y + skew); ctx.lineTo(x + r, y - skew);
      ctx.lineTo(x + 0.2 * r, y + 0.72 * r); ctx.closePath();
      ctx.fillStyle = 'rgba(83,111,124,' + (0.08 + random() * 0.29) + ')'; ctx.fill();
    }
    return arrival;
  }

  const GROW_END = 5700;
  const THAW_START = 8300;
  const SLIDE_START = 9750;
  const SLIDE_END = 12350;
  const FADE_START = 14000;
  const END = 15800;

  // Фактура неподвижна. Карта роста задаёт момент появления каждой крупинки.
  let surface;
  function getSurface(width, height) {
    if (surface && surface.canvas.width === width && surface.canvas.height === height) return surface;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const arrival = paintRimeTexture(ctx);
    // Сохраняем итоговую альфу вместе с гранями, которые Canvas наложил поверх дымки.
    const frame = ctx.getImageData(0, 0, width, height);
    const baseAlpha = new Uint8Array(arrival.length);
    for (let i = 0; i < baseAlpha.length; i++) baseAlpha[i] = frame.data[4 * i + 3];
    surface = { canvas, ctx, arrival, frame, baseAlpha, level: -1 };
    return surface;
  }

  const coverage = new Float32Array(256);
  function growRime(ice, progress) {
    const softness = 48;
    const level = Math.round(progress * (255 + softness));
    if (ice.level === level) return;
    ice.level = level;
    for (let i = 0; i < coverage.length; i++) coverage[i] = smoothstep((level - i) / softness);
    const data = ice.frame.data;
    for (let i = 0; i < ice.baseAlpha.length; i++) {
      data[4 * i + 3] = ice.baseAlpha[i] * coverage[ice.arrival[i]];
    }
    ice.ctx.putImageData(ice.frame, 0, 0);
  }

  // Капля немного отклоняется в сторону, когда набирает воду.
  function dropPosition(slide) {
    return {
      x: WIDTH * 0.875 + 3.4 * slide - 2.5 * Math.sin(2 * Math.PI * slide),
      y: HEIGHT * (0.14 + 0.43 * slide),
    };
  }

  function clearMelt(ctx, thaw, slide) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const start = dropPosition(0);
    ctx.translate(start.x - 1, start.y - 2);
    ctx.scale(1, 0.8);
    const radius = 9.5 * Math.sqrt(thaw);
    const melt = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    melt.addColorStop(0, '#000');
    melt.addColorStop(0.48, '#000');
    melt.addColorStop(1, 'transparent');
    ctx.fillStyle = melt;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();

    if (slide <= 0) return;
    const track = new Path2D();
    track.moveTo(start.x, start.y);
    const steps = Math.ceil(slide * 28);
    for (let i = 1; i <= steps; i++) {
      const point = dropPosition(slide * i / steps);
      track.lineTo(point.x, point.y);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    // Стенки бороздки подтаивают, а сердцевина открывает видео насквозь.
    for (const [width, opacity] of [[12, 0.16], [9, 0.48], [7, 0.82], [5, 1]]) {
      ctx.lineWidth = width;
      ctx.globalAlpha = opacity;
      ctx.stroke(track);
    }
    ctx.restore();
  }

  function drawDrop(ctx, amount, slide) {
    const point = dropPosition(slide);
    const radius = (4.4 + 1.2 * slide) * Math.sqrt(amount);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.scale(radius, radius * (1.12 + 0.11 * Math.sin(slide * Math.PI)));
    ctx.beginPath();
    ctx.moveTo(0.06, -1.12);
    ctx.bezierCurveTo(0.37, -0.76, 0.92, -0.26, 0.90, 0.29);
    ctx.bezierCurveTo(0.86, 1.23, -0.71, 1.36, -0.88, 0.43);
    ctx.bezierCurveTo(-1.00, -0.16, -0.30, -0.74, 0.06, -1.12);
    const glass = ctx.createRadialGradient(-0.30, -0.23, 0, 0.04, 0.15, 1.05);
    glass.addColorStop(0, 'rgba(238,249,251,.42)');
    glass.addColorStop(0.4, 'rgba(201,219,225,.09)');
    glass.addColorStop(0.76, 'rgba(50,77,87,.53)');
    glass.addColorStop(1, 'rgba(222,239,243,.80)');
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = 'rgba(89,111,120,.64)';
    ctx.lineWidth = 0.09;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-0.32, -0.22, 0.22, 0.11, -0.8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,.94)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-0.03, 0.44, 0.58, 0.38, -0.26, 0.22, 1.42);
    ctx.strokeStyle = 'rgba(246,253,255,.76)';
    ctx.stroke();
    ctx.restore();
  }

  let playing = null;
  window.playFrostCorner = function () {
    if (playing) return playing;
    const canvas = document.createElement('canvas');
    canvas.className = 'frost-corner';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;right:0;width:min(17vw,30.22vh);' +
      'aspect-ratio:350/205;pointer-events:none;z-index:14';
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve();
    document.body.appendChild(canvas);

    playing = new Promise(resolve => {
      let ice;
      let frame = -1;
      let dpr = 0;
      function resize() {
        dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.round(canvas.getBoundingClientRect().width * dpr));
        const height = Math.max(1, Math.round(width * HEIGHT / WIDTH));
        if (ice && width === canvas.width && height === canvas.height) return;
        canvas.width = width;
        canvas.height = height;
        ctx.setTransform(width / WIDTH, 0, 0, height / HEIGHT, 0, 0);
        ice = getSurface(width, height);
        frame = -1;
      }
      resize();
      window.addEventListener('resize', resize);
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        if (elapsed >= END) {
          window.removeEventListener('resize', resize);
          canvas.remove();
          playing = null;
          resolve();
          return;
        }
        if ((window.devicePixelRatio || 1) !== dpr) resize();
        let time = Math.floor(elapsed / 32) * 32;
        if (time >= GROW_END && time < THAW_START) time = GROW_END;
        if (time >= SLIDE_END && time < FADE_START) time = SLIDE_END;
        if (time !== frame) {
          frame = time;
          growRime(ice, Math.min(1, time / GROW_END));
          ctx.clearRect(0, 0, WIDTH, HEIGHT);
          ctx.drawImage(ice.canvas, 0, 0, WIDTH, HEIGHT);
          if (time > THAW_START) {
            const thaw = smoothstep((time - THAW_START) / (SLIDE_START - THAW_START));
            const t = (time - SLIDE_START) / (SLIDE_END - SLIDE_START);
            const slide = 0.4 * smoothstep(t / 0.53) + 0.6 * smoothstep((t - 0.46) / 0.54);
            clearMelt(ctx, thaw, slide);
            const water = smoothstep((time - THAW_START - 280) / 1100);
            if (water > 0) drawDrop(ctx, water, slide);
          }
          canvas.style.opacity = 1 - smoothstep((time - FADE_START) / (END - FADE_START));
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    return playing;
  };
})();
