/* ==========================================================
   Log+ · 作品集 —— 交互逻辑
   ========================================================== */
(function () {
  'use strict';

  // 测试模式：?test 关闭入场动画与平滑滚动（用于截图校验）
  if (location.search.indexOf('test') > -1) {
    document.documentElement.classList.add('test');
  }

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

  /* ---------- 首屏引力粒子场（鼠标 / 手指 = 引力核心） ---------- */
  // 桌面：鼠标是引力核心，离开后核心自动巡航，画面一直在流动
  // 手机：屏幕小看得见的部分少，所以半径更大、吸附更强、还带连线和指尖涟漪
  (function field() {
    const cv = $('#pField');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const mq = window.matchMedia('(max-width:1080px)');
    const hint = $('#heroHint');
    let MOBILE = mq.matches;

    let W = 0, H = 0, DPR = 1, R = 1, R2 = 1;
    let P = [], raf = 0, visible = true, lastT = 0;

    function tune() {
      // pull 越大聚集越快，repel 同步加大才不会挤成一坨白斑
      return MOBILE
        ? { rf: .64, pull: .52, swirl: .30, repel: 158, link: 86, linkMax: 38, core: .66, hotT: .38, bright: 1.26, trail: .30 }
        : { rf: .44, pull: .34, swirl: .19, repel: 122, link: 112, linkMax: 44, core: .50, hotT: .50, bright: 1.0, trail: .34 };
    }
    let T = tune();

    // M = 引力核心：x/y 实际位置，px/py 目标位置（指针或自动巡航）
    const M = { x: 0, y: 0, px: 0, py: 0, power: 0, goal: 0, burst: 0, touch: false, act: -1e9, has: false };
    const ripples = [];
    // 首屏自动演示：加载后核心自己划一道弧线，让人一眼看出画面是可以拖的
    const DEMO = { on: !REDUCED, t0: 0 };

    function size() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      T = tune();
      R = Math.max(140, Math.min(W, H) * T.rf); R2 = R * R;
    }

    function seed() {
      // 星空要「多而小」：数量提高，并按 z 分远近 —— 大量暗淡小星 + 少量明亮大星
      const n = Math.max(MOBILE ? 230 : 280, Math.min(MOBILE ? 340 : 420, Math.round(W * H / 1600)));
      const sz = MOBILE ? 1.15 : 1;
      P = [];
      for (let i = 0; i < n; i++) {
        const z = Math.pow(Math.random(), 1.8);        // 0 = 远星，1 = 近星
        P.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
          z,
          r: (.24 + z * 1.8) * sz,
          base: .12 + z * .5,
          ph: Math.random() * 6.283,
          tw: .55 + Math.random() * 1.5,               // 每颗星自己的闪烁节奏
          hot: false,
          red: Math.random() < .12,
          blue: Math.random() < .2
        });
      }
    }

    // 透明度预先量化成 32 级 + 颜色串缓存：每帧少拼 400 多次字符串，省 GC
    const LV = 32;
    const COL = { w: [], r: [], b: [] };
    for (let i = 0; i < LV; i++) {
      const a = (i / (LV - 1)).toFixed(3);
      COL.w.push('rgba(237,233,224,' + a + ')');
      COL.r.push('rgba(255,74,60,' + a + ')');
      COL.b.push('rgba(168,198,255,' + a + ')');
    }

    // 核心光晕：预渲染成一张小贴图，运行时只做一次 drawImage（比每帧建渐变便宜得多）
    const glowCv = document.createElement('canvas');
    (function buildGlow() {
      const S = 160;
      glowCv.width = glowCv.height = S;
      const g = glowCv.getContext('2d');
      const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      gr.addColorStop(0, 'rgba(255,59,47,.16)');
      gr.addColorStop(.42, 'rgba(90,130,255,.085)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
    })();

    function render(now) {
      if (!lastT) lastT = now;
      const dt = Math.min(now - lastT, 48); lastT = now;
      const t = now * .001;
      const step = dt / 16.667;            // 归一化到 60fps
      const ease = k => 1 - Math.pow(1 - k, step);

      /* --- 核心目标：手指/鼠标优先，1.5s 没动静就自动巡航 --- */
      const active = now - M.act < 1500;
      if (DEMO.on && !DEMO.t0) DEMO.t0 = now + 1500;
      const demoAge = DEMO.on && DEMO.t0 ? now - DEMO.t0 : -1;
      const demoing = demoAge >= 0 && demoAge < 3800;
      let tx, ty, goal;
      if (active) {
        tx = M.px; ty = M.py; goal = M.touch ? 1.3 : 1;
      } else if (demoing) {
        const k = demoAge / 3800;
        const e = k * k * (3 - 2 * k);                     // 缓入缓出
        tx = W * (.22 + .56 * e);
        ty = H * (.30 + .12 * Math.sin(e * Math.PI * 2.1));
        goal = MOBILE ? 1.05 : .9;
      } else {
        tx = W * (.5 + .27 * Math.sin(t * .38));
        ty = H * (.40 + .19 * Math.sin(t * .57 + 1.7));
        goal = T.core;
      }
      if (!M.has) { M.x = tx; M.y = ty; M.has = true; }
      // 核心追指针跟得更紧（原来 .14 会有明显「拖后腿」的延迟感）
      M.x += (tx - M.x) * ease(.34);
      M.y += (ty - M.y) * ease(.34);
      M.power += (goal - M.power) * ease(.16);
      M.burst *= Math.pow(.9, step);

      /* --- 残影：让粒子在手指后面拖一条尾巴，触屏上特别明显 --- */
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + T.trail + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      const pm = .55 + M.power * .55;
      const repel2 = T.repel * T.repel;

      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const dx = M.x - p.x, dy = M.y - p.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < R2 && d2 > .01) {
          const d = Math.sqrt(d2);
          const f = Math.pow(1 - d / R, 1.7);
          const nx = dx / d, ny = dy / d;
          // 近处的星反应大、远处的星只轻轻挪一点 → 画面有景深
          const pz = .72 + p.z * .62;
          // 法向吸附 + 切向旋转 → 聚成漩涡而不是挤成一个点
          p.vx += (nx * T.pull - ny * T.swirl) * f * M.power * pz * step;
          p.vy += (ny * T.pull + nx * T.swirl) * f * M.power * pz * step;
          if (d2 < repel2) {
            const rp = (1 - d / T.repel) * .78 * M.power * step;
            p.vx -= nx * rp; p.vy -= ny * rp;
          }
          p.hot = f > T.hotT;
          if (M.burst > .03 && d2 < R2 * .6) {
            p.vx -= nx * M.burst * 3.4;
            p.vy -= ny * M.burst * 3.4;
            p.hot = true;
          }
        } else {
          p.hot = false;
        }

        p.x += p.vx * step; p.y += p.vy * step;
        // 阻尼放松 → 被吸走的速度能保留住，聚拢更利落
        const damp = Math.pow(.974, step);
        p.vx *= damp; p.vy *= damp;
        p.vx += (Math.random() - .5) * .009;
        p.vy += (Math.random() - .5) * .009;

        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;

        const tw = .72 + .28 * Math.sin(t * p.tw + p.ph);
        const a = Math.min(.88, (p.hot ? p.base + .42 : p.base) * tw * pm * T.bright);
        const rr = p.r * (p.hot ? 1.5 : 1);

        const idx = (a * (LV - 1)) | 0;
        ctx.fillStyle = p.red ? COL.r[idx] : p.blue ? COL.b[idx] : COL.w[idx];

        // 小星点用 fillRect：视觉上与圆点几乎无差，但比 arc+fill 快得多
        if (rr < .95) {
          const s = rr < .55 ? 1 : 1.7;
          ctx.fillRect(p.x - s * .5, p.y - s * .5, s, s);
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.2832); ctx.fill();
        }

        if (p.hot) {
          ctx.fillStyle = p.red ? 'rgba(255,59,47,.09)' : 'rgba(150,185,255,.08)';
          ctx.beginPath(); ctx.arc(p.x, p.y, rr * 4.6, 0, 6.2832); ctx.fill();
        }
      }

      /* --- 核心周围的连线：手机上靠这张“网”把交互讲清楚 --- */
      const near = [];
      const near2 = R2 * .72;
      for (let i = 0; i < P.length && near.length < T.linkMax; i++) {
        const dx = P[i].x - M.x, dy = P[i].y - M.y;
        if (dx * dx + dy * dy < near2) near.push(P[i]);
      }
      const LD = T.link, LD2 = LD * LD;
      const LDA = MOBILE ? .36 : .26;
      ctx.lineWidth = .6;
      // 按距离分 3 档、每档只 stroke 一次：线还是渐隐的，但描边次数从几百降到 3
      for (let band = 0; band < 3; band++) {
        const lo = band === 0 ? 0 : band === 1 ? .34 : .66;
        const hi = band === 0 ? .34 : band === 1 ? .66 : 1;
        let drew = false;
        ctx.beginPath();
        for (let i = 0; i < near.length; i++) {
          const a = near[i];
          for (let j = i + 1; j < near.length; j++) {
            const b = near[j];
            const ddx = a.x - b.x, ddy = a.y - b.y;
            const dd = ddx * ddx + ddy * ddy;
            if (dd < LD2) {
              const k = Math.sqrt(dd) / LD;
              if (k >= lo && k < hi) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); drew = true; }
            }
          }
        }
        if (drew) {
          ctx.strokeStyle = 'rgba(150,185,255,' + (LDA * (1 - (lo + hi) * .42)).toFixed(3) + ')';
          ctx.stroke();
        }
      }

      /* --- 核心光晕（预渲染贴图，避免每帧重建径向渐变） --- */
      if (M.power > .04) {
        const rad = R * .72;
        ctx.globalAlpha = M.power > 1 ? 1 : M.power;
        ctx.drawImage(glowCv, M.x - rad, M.y - rad, rad * 2, rad * 2);
        ctx.globalAlpha = 1;
      }

      /* --- 按下时的扩散涟漪 --- */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += step;
        const life = r.t / 40;
        if (life >= 1) { ripples.splice(i, 1); continue; }
        const rad = 6 + life * (MOBILE ? 176 : 132);
        ctx.strokeStyle = 'rgba(255,92,74,' + ((1 - life) * (MOBILE ? .85 : .6)).toFixed(3) + ')';
        ctx.lineWidth = 2.6 * (1 - life);
        ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.2832); ctx.stroke();
      }

      /* --- 触摸时指尖的准星（屏幕小，做得比桌面更实才看得见） --- */
      if (M.touch && active) {
        const pulse = 1 + .06 * Math.sin(t * 6);
        const big = MOBILE ? 1.35 : 1;
        ctx.strokeStyle = 'rgba(255,255,255,.68)';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(M.x, M.y, 30 * pulse * big, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,86,68,.9)';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(M.x, M.y, 15 * pulse * big, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = 'rgba(255,86,68,.95)';
        ctx.beginPath(); ctx.arc(M.x, M.y, 2.8, 0, 6.2832); ctx.fill();
        for (let k = 0; k < 4; k++) {
          const ang = k * Math.PI / 2 + t * .8;
          const x1 = M.x + Math.cos(ang) * 38 * big, y1 = M.y + Math.sin(ang) * 38 * big;
          const x2 = M.x + Math.cos(ang) * 49 * big, y2 = M.y + Math.sin(ang) * 49 * big;
          ctx.strokeStyle = 'rgba(255,255,255,.72)';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(render);
    }

    function boot() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(render); }
    function halt() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    /* --- 指针 --- */
    const setP = (e, touch) => {
      const r = cv.getBoundingClientRect();
      M.px = e.clientX - r.left;
      M.py = e.clientY - r.top;
      M.touch = touch;
      M.act = performance.now();
    };
    window.addEventListener('pointermove', e => {
      DEMO.on = false;
      setP(e, e.pointerType !== 'mouse');
      hideHint(2600);
      boot();
    }, { passive: true });
    window.addEventListener('pointerdown', e => {
      DEMO.on = false;
      setP(e, e.pointerType !== 'mouse');
      M.burst = 1;
      ripples.push({ x: M.px, y: M.py, t: 0 });
      hideHint(2600);
      boot();
    }, { passive: true });

    let hintTimer = 0;
    function hideHint(delay) {
      if (!hint) return;
      if (hintTimer) { clearTimeout(hintTimer); hintTimer = 0; }
      // 交互后不立刻消失：留 2.6s 让人看清这行字说的是什么
      hintTimer = setTimeout(() => hint.classList.add('is-off'), delay || 0);
    }

    /* --- 可见性 & 尺寸 --- */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible) boot(); else halt();
      }, { threshold: 0 }).observe(cv);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) halt(); else boot();
    });
    let rz = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(() => { size(); seed(); boot(); }, 160);
    });

    size();
    seed();
    if (hint) {
      const label = hint.querySelector('span');
      if (label) label.textContent = MOBILE ? '滑动屏幕 · 粒子会跟着你' : '移动鼠标 · 粒子会跟过来';
      hintTimer = setTimeout(hideHint, 9000);
    }
    boot();
  })();

  /* ---------- 发光网格（鼠标经过发光） ---------- */
  // host=null → 全屏固定画布（跟随窗口）；否则限定在 host 元素内（Hero）
  function createGlowGrid(cv, host, baseAlpha) {
    const ctx = cv.getContext('2d');
    const CELL = 74, R = CELL * 3.4;
    let w = 0, h = 0, base = null;
    let mx = -1e4, my = -1e4, gx = -1e4, gy = -1e4;
    let glow = 0, target = 0, raf = null, visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host ? host.clientWidth : window.innerWidth;
      h = host ? host.clientHeight : window.innerHeight;
      if (!w || !h) return;
      cv.width = w * dpr; cv.height = h * dpr;
      base = document.createElement('canvas');
      base.width = cv.width; base.height = cv.height;
      const b = base.getContext('2d');
      b.scale(dpr, dpr);
      b.strokeStyle = 'rgba(237,233,224,' + baseAlpha + ')';
      b.lineWidth = 1;
      b.beginPath();
      for (let x = 0.5; x <= w; x += CELL) { b.moveTo(x, 0); b.lineTo(x, h); }
      for (let y = 0.5; y <= h; y += CELL) { b.moveTo(0, y); b.lineTo(w, y); }
      b.stroke();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0, w, h);
      if (document.documentElement.classList.contains('test')) {
        mx = w * 0.4; my = h * 0.42; target = 1; kick();
      }
    }

    function frame() {
      raf = null;
      if (gx < -9999) { gx = mx; gy = my; }
      gx += (mx - gx) * 0.16; gy += (my - gy) * 0.16;
      glow += (target - glow) * 0.09;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0, w, h);   // 网格常显（微弱）
      if (glow > 0.01) {
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 1.15);
        g.addColorStop(0, 'rgba(255,59,47,' + (0.13 * glow) + ')');
        g.addColorStop(0.55, 'rgba(198,60,140,' + (0.07 * glow) + ')');
        g.addColorStop(1, 'rgba(198,60,140,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        const x0 = Math.max(0, Math.floor((gx - R) / CELL));
        const x1 = Math.min(Math.floor(w / CELL), Math.floor((gx + R) / CELL));
        const y0 = Math.max(0, Math.floor((gy - R) / CELL));
        const y1 = Math.min(Math.floor(h / CELL), Math.floor((gy + R) / CELL));
        for (let ix = x0; ix <= x1; ix++) {
          for (let iy = y0; iy <= y1; iy++) {
            const cx = ix * CELL + CELL / 2, cy = iy * CELL + CELL / 2;
            const d = Math.hypot(cx - gx, cy - gy);
            const a = Math.pow(Math.max(0, 1 - d / R), 2) * glow;
            if (a < 0.012) continue;
            ctx.fillStyle = 'rgba(255,59,47,' + (a * 0.11) + ')';
            ctx.fillRect(ix * CELL + 1, iy * CELL + 1, CELL - 2, CELL - 2);
            ctx.strokeStyle = 'rgba(255,96,86,' + (a * 0.7) + ')';
            ctx.lineWidth = 1;
            ctx.strokeRect(ix * CELL + 0.5, iy * CELL + 0.5, CELL - 1, CELL - 1);
          }
        }
      }
      if (target > 0 || glow > 0.01) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    if (host) {
      host.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = cv.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top;
        target = 1; kick();
      });
      host.addEventListener('pointerleave', () => { target = 0; kick(); });
      new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible && target > 0) kick();
      }).observe(host);
    } else {
      window.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        mx = e.clientX; my = e.clientY;
        target = 1; kick();
      });
      document.documentElement.addEventListener('mouseleave', () => { target = 0; kick(); });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && target > 0) kick();
      });
    }
    window.addEventListener('resize', resize);
    resize();
  }
  const fxCv = $('#fxGrid');
  if (fxCv) createGlowGrid(fxCv, null, 0.03);

  /* ---------- 展示带（环形 coverflow 轮播：中间大两边小 / 无限轮转 / 可拖拽） ---------- */
  (function reel() {
    const wrapEl = $('.reel'), track = $('#reelTrack');
    if (!wrapEl || !track || !REEL.length) return;
    const N = REEL.length;
    const items = REEL.map((r, i) => {
      const el = document.createElement('div');
      el.className = 'reelItem';
      el.dataset.id = r.id;
      el.dataset.i = i;
      el.innerHTML = `<img src="${esc(r.img)}" alt="${esc(r.sub)}" decoding="async"${i < 3 ? ' fetchpriority="high"' : ''} draggable="false">
        <div class="reelItem__cap">${esc(r.cap)}<b>${esc(r.sub)}</b></div>`;
      track.appendChild(el);
      return el;
    });

    let idx = 0;               // 中心项索引（拖动时为浮点）
    let spacing = 180;
    let timer = null, resumeT = null;
    let down = false, startX = 0, baseIdx = 0, moved = false, suppress = false;

    const mod = (a, n) => ((a % n) + n) % n;
    const off = (i, c) => { let o = mod(i - c, N); if (o > N / 2) o -= N; return o; };

    function layout() {
      items.forEach((el, i) => {
        const o = off(i, idx), ao = Math.abs(o);
        const s = Math.max(0.45, 1 - ao * 0.2);
        const op = ao > 2.4 ? 0 : Math.max(0, 1 - ao * 0.28);
        el.style.transform =
          'translate(-50%,-50%) translateX(' + (o * spacing) + 'px) translateY(' + (ao * 10) + 'px) scale(' + s + ')';
        el.style.opacity = op;
        el.style.zIndex = 50 - Math.round(ao * 10);
        el.style.filter = 'grayscale(' + Math.min(1, ao * 1.1) + ') brightness(' + (1 - Math.min(ao * 0.16, 0.45)) + ')';
        el.style.pointerEvents = op === 0 ? 'none' : 'auto';
      });
    }

    function measure() { spacing = items[0].offsetWidth * 0.88; layout(); }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      if (REDUCED || timer) return;
      timer = setInterval(() => {
        if (document.hidden) return;
        idx = mod(Math.round(idx) + 1, N);
        layout();
      }, 3600);
    }
    function resumeLater(ms) {
      stop();
      if (resumeT) clearTimeout(resumeT);
      resumeT = setTimeout(start, ms);
    }

    track.addEventListener('pointerdown', e => {
      down = true; moved = false;
      startX = e.clientX; baseIdx = idx;
      wrapEl.classList.add('is-drag');
      stop(); if (resumeT) clearTimeout(resumeT);
    });
    // 注意：不用 setPointerCapture（它会改变 click 的派发目标导致点不到卡片），
    // 移动/抬起监听挂在 window 上
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 8) moved = true;
      idx = baseIdx - dx / spacing;
      layout();
    });
    const endDrag = () => {
      if (!down) return;
      down = false;
      wrapEl.classList.remove('is-drag');
      idx = mod(Math.round(idx), N);
      layout();
      if (moved) { suppress = true; setTimeout(() => { suppress = false; }, 80); }
      resumeLater(2600);
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', endDrag);

    track.addEventListener('click', e => {
      if (suppress) { e.stopPropagation(); return; }
      const it = e.target.closest('.reelItem');
      if (!it) return;
      // 点哪张卡都直接进播放面板（同时把该卡归位到中间）
      const i = +it.dataset.i;
      idx = mod(i, N);
      layout();
      openLightbox(it.dataset.id);
    }, true);

    window.addEventListener('resize', measure);
    measure();
    start();
  })();

  /* ---------- 滚动入场 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  const watchReveal = () => $$('[data-reveal]:not(.is-in)').forEach(el => io.observe(el));

  /* ---------- 数字 ---------- */
  function runCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (REDUCED) { el.textContent = target; return; }
    const dur = 1200, t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  const countIO = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { runCount(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });

  /* ---------- 导航 ---------- */
  (function nav() {
    const bar = $('#nav'), burger = $('#burger'), links = $('#navLinks');
    const onScroll = () => bar.classList.toggle('is-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    burger.addEventListener('click', () => {
      burger.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });
    $$('.nav__link').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('is-open'); links.classList.remove('is-open');
    }));

    const secs = ['works', 'path', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
    const map = {};
    $$('.nav__link').forEach(a => { map[a.getAttribute('href').slice(1)] = a; });
    const spy = new IntersectionObserver(es => {
      es.forEach(e => {
        const a = map[e.target.id];
        if (a && e.isIntersecting) {
          $$('.nav__link').forEach(x => x.classList.remove('is-active'));
          a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => spy.observe(s));
  })();

  /* ---------- 作品 ---------- */
  const grid = $('#worksGrid'), empty = $('#worksEmpty'), filtersBox = $('#filters');
  const CAT = {};
  CATEGORIES.forEach(c => { CAT[c.id] = c; });

  function renderFilters() {
    filtersBox.innerHTML = CATEGORIES.map(c => {
      const n = PROJECTS.filter(p => c.id === 'all' || p.cat === c.id).length;
      return `<button class="filter" data-cat="${c.id}">${esc(c.name)}<em>${n}</em></button>`;
    }).join('');
    filtersBox.firstElementChild && filtersBox.firstElementChild.classList.add('is-on');

    filtersBox.addEventListener('click', e => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      $$('.filter', filtersBox).forEach(b => b.classList.remove('is-on'));
      btn.classList.add('is-on');
      applyFilter(btn.dataset.cat);
    });
  }

  function cardHTML(p, idx) {
    const cat = CAT[p.cat];
    const hasVideo = !!p.bvid;
    const media = `<img class="work__cover" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" decoding="async">
        ${hasVideo ? `<span class="work__bili">BILIBILI</span>` : ''}`;

    return `<article class="work" data-cat="${p.cat}" data-id="${p.id}">
      <div class="work__media" ${hasVideo ? 'data-play' : ''}>
        ${media}
        <span class="work__num">${String(idx + 1).padStart(2, '0')}</span>
        ${hasVideo ? `<div class="work__play"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>` : ''}
      </div>
      <div class="work__body">
        <span class="work__cat">${esc(cat.en)} / ${esc(cat.name)}</span>
        <h3 class="work__title">${esc(p.title)}<span class="work__role">${esc(p.role)}</span></h3>
        <p class="work__desc">${esc(p.desc)}</p>
        <div class="work__tags">${p.tags.map(t => `<span class="work__tag">${esc(t)}</span>`).join('')}</div>
        <div class="work__foot">
          <span class="work__date">${esc(p.date)}</span>
          ${hasVideo
            ? `<button class="work__btn" data-play><svg viewBox="0 0 24 24" width="9" height="9" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>播放演示</button>`
            : `<span class="work__btn work__btn--static">暂无视频</span>`}
        </div>
      </div>
    </article>`;
  }

  function renderWorks() {
    grid.innerHTML = PROJECTS.map(cardHTML).join('');

    $$('.work__cover', grid).forEach(img => {
      img.addEventListener('error', () => { img.style.display = 'none'; });
    });

    const cards = $$('.work', grid);
    const cio = new IntersectionObserver(es => {
      es.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('is-in'), i * 80);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    cards.forEach(c => cio.observe(c));

    cards.forEach(card => {
      const media = $('.work__media', card);
      if (!media) return;
      media.addEventListener('click', () => openLightbox(card.dataset.id));
      const btn = $('.work__btn', card);
      if (btn) btn.addEventListener('click', e => { e.stopPropagation(); openLightbox(card.dataset.id); });
    });
  }

  function applyFilter(cat) {
    let n = 0;
    $$('.work', grid).forEach(c => {
      const show = cat === 'all' || c.dataset.cat === cat;
      c.classList.toggle('is-hidden', !show);
      if (show) { n++; c.classList.add('is-in'); }
    });
    empty.classList.toggle('is-on', n === 0);
  }

  /* ---------- 播放面板（站内内嵌 B 站播放器，点击即播） ---------- */
  const lb = $('#lightbox'), lbStage = $('#lbStage'), lbBili = $('#lbBili');
  let lastFocus = null;

  function openLightbox(id) {
    const p = PROJECTS.find(x => x.id === id);
    if (!p || !p.bvid) return;
    lastFocus = document.activeElement;

    const compact = window.matchMedia('(max-width: 820px)').matches;
    $('#lbTitle').textContent = p.title;
    $('#lbSub').textContent = (p.role ? p.role + ' · ' : '') + p.date
      + (!compact && CAT[p.cat] ? ' · ' + CAT[p.cat].name : '');
    $('#lbTags').innerHTML = p.tags.map(t => `<span>${esc(t)}</span>`).join('');
    lbBili.href = biliWatch(p.bvid);

    // 技术规格卡
    const spec = (p.spec || []).map(([k, v]) =>
      `<div class="spec__item"><span class="spec__k">${esc(k)}</span><span class="spec__v">${esc(v)}</span></div>`).join('');
    $('#lbSpec').innerHTML = spec + (p.deliver
      ? `<div class="spec__item spec__item--wide"><span class="spec__k">交付成果</span><span class="spec__v">${esc(p.deliver)}</span></div>`
      : '');

    // 分节说明
    $('#lbSections').innerHTML = (p.sections || []).map(([t, txt], i) =>
      `<section class="lbSec">
         <h4 class="lbSec__t"><i>${String(i + 1).padStart(2, '0')}</i>${esc(t)}</h4>
         <p>${esc(txt)}</p>
       </section>`).join('');

    lbStage.classList.remove('is-ready');
    const iframeHTML =
      '<iframe src="' + esc(biliEmbed(p.bvid, true)) + '"'
      + ' allow="autoplay; fullscreen; picture-in-picture; encrypted-media"'
      + ' allowfullscreen scrolling="no" frameborder="0" loading="eager"'
      + ' title="' + esc(p.title) + '"></iframe>';
    const loadHTML = '<div class="lightbox__load"><i></i>LOADING BILIBILI PLAYER</div>';

    // 触屏设备：先给一张封面 + 播放键，点了再挂载播放器（避免进来就是黑屏）
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      lbStage.innerHTML =
        '<button class="lbPoster" type="button" aria-label="播放演示视频">'
        + '<img src="' + esc(p.cover) + '" alt="" draggable="false">'
        + '<span class="lbPoster__play"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>'
        + '<span class="lbPoster__t">点击播放演示视频</span>'
        + '</button>';
      const poster = lbStage.querySelector('.lbPoster');
      poster.addEventListener('click', () => {
        lbStage.innerHTML = loadHTML + iframeHTML;
        const f = lbStage.querySelector('iframe');
        if (f) f.addEventListener('load', () => lbStage.classList.add('is-ready'), { once: true });
        setTimeout(() => lbStage.classList.add('is-ready'), 6000);
      }, { once: true });
    } else {
      lbStage.innerHTML = loadHTML + iframeHTML;
      const fr = lbStage.querySelector('iframe');
      if (fr) {
        fr.addEventListener('load', () => lbStage.classList.add('is-ready'), { once: true });
        setTimeout(() => lbStage.classList.add('is-ready'), 6000);
      }
    }

    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lb.scrollTop = 0;
    $('#lbClose').focus();
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    lbStage.classList.remove('is-ready');
    lbStage.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  $$('[data-close]', lb).forEach(el => el.addEventListener('click', closeLightbox));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLightbox(); });

  /* ---------- 经历 ---------- */
  function renderPath() {
    const box = $('#timeline');
    if (!box) return;
    box.innerHTML = TIMELINE.map((t, i) => {
      const catName = t.cat === 'life' ? '志愿经历' : (CAT[t.cat] ? CAT[t.cat].name : '');
      return `<li class="path__item" data-reveal>
        <span class="path__time">${esc(t.time)}</span>
        <span class="path__num">${String(i + 1).padStart(2, '0')}</span>
        <div class="path__title">${esc(t.title)}<span>${esc(t.role)}</span></div>
        <span class="path__cat">${esc(catName)}</span>
      </li>`;
    }).join('');
  }

  /* ---------- 启动 ---------- */
  // 动态统计：项目数 / 演示视频数（随 data.js 自动更新）
  const vidCount = PROJECTS.filter(p => p.bvid).length;
  const note = $('#worksNote');
  if (note) note.textContent = PROJECTS.length + ' 个项目 · ' + vidCount + ' 支演示视频 · 点击封面即在站内播放';
  const nv = $('#numVideos');
  if (nv) nv.dataset.count = vidCount;

  renderFilters();
  renderWorks();
  renderPath();
  watchReveal();
  $$('[data-count]').forEach(el => countIO.observe(el));
  setTimeout(watchReveal, 80);
})();
