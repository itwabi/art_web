(function () {
  var summaryEl = document.getElementById('finish-summary');
  var attachBtn = document.getElementById('attach');
  var input = document.getElementById('photo-input');
  var box = document.getElementById('attach-box');
  var strip = document.getElementById('strip');
  var sendBtn = document.getElementById('send');
  var statusEl = document.getElementById('attach-status');

  var CLOSE = '<svg class="ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var result = null, settings = null;
  try { result = JSON.parse(sessionStorage.getItem('sketchResult')); } catch (e) {}
  try { settings = JSON.parse(sessionStorage.getItem('sketchSettings')); } catch (e) {}

  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' набросок';
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + ' наброска';
    return n + ' набросков';
  }

  if (result) {
    var time = result.seconds < 60
      ? 'меньше минуты'
      : 'около ' + Math.round(result.seconds / 60) + ' мин';
    summaryEl.textContent = plural(result.frames) + ' · ' + time;
  }

  var items = [];
  var sending = false;

  function setStatus(html, isError) {
    statusEl.className = 'upload-status' + (isError ? ' err' : '');
    statusEl.innerHTML = html;
  }

  function staged() {
    return items.filter(function (it) { return !it.sent; });
  }

  function render() {
    box.hidden = !items.length;
    attachBtn.hidden = !!items.length;

    strip.innerHTML = items.map(function (it, i) {
      return '<div class="strip-item' + (it.sent ? ' sent' : '') + '">' +
        '<button class="strip-open" type="button" data-open="' + i + '" aria-label="Открыть фото"><img src="' + it.url + '" alt="Фото ' + (i + 1) + '"></button>' +
        (it.sent
          ? '<span class="strip-ok">Прикреплено</span>'
          : '<button class="strip-del" type="button" data-del="' + i + '" aria-label="Убрать фото">' + CLOSE + '</button>') +
        '</div>';
    }).join('') + '<button class="strip-add" type="button" id="strip-add" aria-label="Добавить ещё фото"' + (sending ? ' disabled' : '') + '>+</button>';

    var n = staged().length;
    sendBtn.hidden = !n;
    sendBtn.disabled = sending;
    sendBtn.textContent = sending ? 'Загрузка…' : (n > 1 ? 'Прикрепить (' + n + ')' : 'Прикрепить');
  }

  function pick() {
    if (!App.isLoggedIn()) {
      setStatus('Нельзя прикрепить фото, пока вы не вошли в профиль. ' +
        '<a href="' + App.loginUrl() + '"><u>Войти в аккаунт</u></a>', true);
      return;
    }
    input.click();
  }

  attachBtn.addEventListener('click', pick);

  strip.addEventListener('click', function (e) {
    if (e.target.closest('#strip-add')) return pick();
    var del = e.target.closest('[data-del]');
    if (del && !sending) {
      var removed = items.splice(parseInt(del.getAttribute('data-del'), 10), 1)[0];
      URL.revokeObjectURL(removed.url);
      setStatus('', false);
      return render();
    }
    var open = e.target.closest('[data-open]');
    if (open) {
      Lightbox.open(items.map(function (it) { return it.url; }), parseInt(open.getAttribute('data-open'), 10));
    }
  });

  input.addEventListener('change', function () {
    Array.prototype.forEach.call(input.files, function (file) {
      items.push({ file: file, url: URL.createObjectURL(file), sent: false });
    });
    input.value = '';
    setStatus('', false);
    render();
    strip.scrollLeft = strip.scrollWidth;
  });

  sendBtn.addEventListener('click', function () {
    var batch = staged();
    if (!batch.length || sending) return;
    if (!App.isLoggedIn()) return pick();

    sending = true;
    setStatus('', false);
    render();

    Api.uploadAlbum(batch.map(function (it) { return it.file; }), settings && settings.categories).then(function () {
      batch.forEach(function (it) { it.sent = true; });
      setStatus('Фото сохранено. Его можно посмотреть в «<a href="../profile-works/profile-works.html"><u>Ваших работах</u></a>».', false);
    }).catch(function (err) {
      setStatus(Api.esc(err.status ? err.message : 'Нет связи с сервером. Проверьте, что бэкенд запущен'), true);
    }).then(function () {
      sending = false;
      render();
    });
  });
})();
