(function () {
  var MIN = 1, MAX = 6, STEP = 1.5;

  var CLOSE = '<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var PREV = '<svg class="ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var NEXT = '<svg class="ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  var root = null, stage, img, counter, btnPrev, btnNext, btnZoom;
  var urls = [], index = 0;
  var scale = 1, tx = 0, ty = 0;
  var pointers = {}, startDist = 0, startScale = 1, dragged = false, lastFocus = null;

  function build() {
    root = document.createElement('div');
    root.className = 'lb';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Просмотр фото');
    root.hidden = true;
    root.innerHTML =
      '<div class="lb-stage"><img class="lb-img" alt="" draggable="false"></div>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Закрыть">' + CLOSE + '</button>' +
      '<span class="lb-counter"></span>' +
      '<button class="lb-btn lb-nav lb-prev" type="button" aria-label="Предыдущее фото">' + PREV + '</button>' +
      '<button class="lb-btn lb-nav lb-next" type="button" aria-label="Следующее фото">' + NEXT + '</button>' +
      '<div class="lb-tools">' +
        '<button class="lb-btn" type="button" data-zoom="out" aria-label="Уменьшить">−</button>' +
        '<button class="lb-btn lb-zoom" type="button" data-zoom="reset" aria-label="Сбросить масштаб">100%</button>' +
        '<button class="lb-btn" type="button" data-zoom="in" aria-label="Приблизить">+</button>' +
      '</div>';
    document.body.appendChild(root);

    stage = root.querySelector('.lb-stage');
    img = root.querySelector('.lb-img');
    counter = root.querySelector('.lb-counter');
    btnPrev = root.querySelector('.lb-prev');
    btnNext = root.querySelector('.lb-next');
    btnZoom = root.querySelector('.lb-zoom');

    root.querySelector('.lb-close').addEventListener('click', close);
    btnPrev.addEventListener('click', function () { go(-1); });
    btnNext.addEventListener('click', function () { go(1); });
    root.querySelector('.lb-tools').addEventListener('click', function (e) {
      var b = e.target.closest('[data-zoom]');
      if (!b) return;
      var z = b.getAttribute('data-zoom');
      if (z === 'in') zoomTo(scale * STEP, 0, 0);
      else if (z === 'out') zoomTo(scale / STEP, 0, 0);
      else reset();
    });

    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var c = center(e);
      zoomTo(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2), c.x, c.y);
    }, { passive: false });
    stage.addEventListener('dblclick', function (e) {
      var c = center(e);
      if (scale > 1.01) reset(); else zoomTo(2.5, c.x, c.y);
    });
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('click', function (e) {
      if (e.target === stage && !dragged) close();
    });
    document.addEventListener('keydown', onKey);
  }

  function center(e) {
    var r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  }

  function clamp() {
    var maxX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2) + 40;
    var maxY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2) + 40;
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
    if (scale <= 1) { tx = 0; ty = 0; }
  }

  function apply() {
    clamp();
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    stage.classList.toggle('zoomed', scale > 1.01);
    btnZoom.textContent = Math.round(scale * 100) + '%';
  }

  function zoomTo(next, cx, cy) {
    next = Math.max(MIN, Math.min(MAX, next));
    var k = next / scale;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    scale = next;
    apply();
  }

  function reset() { scale = 1; tx = 0; ty = 0; apply(); }

  function onDown(e) {
    if (e.target.closest('.lb-btn')) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    dragged = false;
    var ids = Object.keys(pointers);
    if (ids.length === 2) {
      startDist = dist();
      startScale = scale;
    }
  }

  function dist() {
    var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onMove(e) {
    var p = pointers[e.pointerId];
    if (!p) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (Math.abs(e.clientX - p.sx) + Math.abs(e.clientY - p.sy) > 6) dragged = true;

    var ids = Object.keys(pointers);
    if (ids.length === 2) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      var r = stage.getBoundingClientRect();
      var mx = (a.x + b.x) / 2 - r.left - r.width / 2, my = (a.y + b.y) / 2 - r.top - r.height / 2;
      zoomTo(startScale * dist() / startDist, mx, my);
    } else if (scale > 1.01) {
      tx += dx; ty += dy;
      apply();
    }
  }

  function onUp(e) {
    var p = pointers[e.pointerId];
    delete pointers[e.pointerId];
    if (p && scale <= 1.01 && !Object.keys(pointers).length) {
      var dx = e.clientX - p.sx, dy = e.clientY - p.sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    }
    if (Object.keys(pointers).length === 1) {
      var left = pointers[Object.keys(pointers)[0]];
      left.sx = left.x; left.sy = left.y;
    }
  }

  function onKey(e) {
    if (!root || root.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === '+' || e.key === '=') zoomTo(scale * STEP, 0, 0);
    else if (e.key === '-') zoomTo(scale / STEP, 0, 0);
    else if (e.key === '0') reset();
  }

  function go(step) {
    if (urls.length < 2) return;
    index = (index + step + urls.length) % urls.length;
    show();
  }

  function show() {
    reset();
    img.src = urls[index];
    var many = urls.length > 1;
    btnPrev.hidden = btnNext.hidden = !many;
    counter.hidden = !many;
    counter.textContent = (index + 1) + ' / ' + urls.length;
    if (many) {
      new Image().src = urls[(index + 1) % urls.length];
    }
  }

  function open(list, start) {
    if (!list || !list.length) return;
    if (!root) build();
    urls = list.slice();
    index = Math.max(0, Math.min(urls.length - 1, start || 0));
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add('lb-open');
    show();
    root.querySelector('.lb-close').focus();
  }

  function close() {
    if (!root || root.hidden) return;
    root.hidden = true;
    pointers = {};
    img.removeAttribute('src');
    document.documentElement.classList.remove('lb-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.Lightbox = { open: open, close: close };
})();
