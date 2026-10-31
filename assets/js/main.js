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

  /* ---------- Hero 背景画面 ---------- */
  (function heroPoster() {
    const img = $('#heroPoster');
    if (!img) return;
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  })();

  /* ---------- Hero 顶部 ticker ---------- */
  (function ticker() {
    const el = $('#heroTicker');
    if (!el) return;
    const words = ['UE5', 'GAS SYSTEM', 'PCG', 'UNITY', 'C#', 'STEAMVR', 'AR', 'BLENDER', 'ANIMATION'];
    let i = 0;
    const show = () => { el.textContent = 'SYS / ' + words[i]; i = (i + 1) % words.length; };
    show();
    if (!REDUCED) setInterval(show, 2200);
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
  const heroCv = $('#heroGrid');
  if (heroCv) createGlowGrid(heroCv, heroCv.closest('.hero'), 0.045);
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
      el.innerHTML = `<img src="${esc(r.img)}" alt="${esc(r.sub)}" loading="lazy" draggable="false">
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

  /* ---------- 方向列表 + 预览图 ---------- */
  (function studio() {
    const list = $('#studioList'), img = $('#studioImg');
    if (!list) return;
    list.innerHTML = STUDIO.map((s, i) => `<li class="studio__item" data-img="${esc(s.img)}">
        <div class="studio__body">
          <span class="studio__en">${esc(s.en)}</span>
          <h3 class="studio__name">${esc(s.name)}</h3>
          <p class="studio__desc">${esc(s.desc)}</p>
        </div>
      </li>`).join('');
    if (!img) return;
    list.addEventListener('mouseover', e => {
      const li = e.target.closest('.studio__item');
      if (!li || li.dataset.img === img.dataset.cur) return;
      img.dataset.cur = li.dataset.img;
      img.classList.add('is-fade');
      const swap = () => {
        img.src = li.dataset.img;
        img.addEventListener('load', () => img.classList.remove('is-fade'), { once: true });
        setTimeout(() => img.classList.remove('is-fade'), 500);
      };
      setTimeout(swap, 160);
    });
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

    const secs = ['about', 'studio', 'works', 'path', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
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
    const media = `<img class="work__cover" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy">
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
