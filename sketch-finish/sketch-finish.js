(function () {
  var summaryEl = document.getElementById('finish-summary');
  var attachBtn = document.getElementById('attach');
  var input = document.getElementById('photo-input');
  var thumbs = document.getElementById('thumbs');
  var statusEl = document.getElementById('attach-status');

  // ---------- итог тренировки ----------
  var result = null;
  try { result = JSON.parse(sessionStorage.getItem('sketchResult')); } catch (e) {}

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

  // ---------- прикрепление фото ----------
  function setStatus(html, isError) {
    statusEl.className = 'upload-status' + (isError ? ' err' : '');
    statusEl.innerHTML = html;
  }

  attachBtn.addEventListener('click', function () {
    if (!App.isLoggedIn()) {
      setStatus('Нельзя прикрепить фото, пока вы не вошли в профиль. ' +
        '<a href="../profile-guest/profile-guest.html"><u>Войти в аккаунт</u></a>', true);
      return;
    }
    input.click();
  });

  input.addEventListener('change', function () {
    var files = Array.prototype.slice.call(input.files);
    if (!files.length) return;

    attachBtn.disabled = true;
    setStatus('Загрузка…', false);
    var saved = 0, errors = [];

    // грузим по очереди, чтобы не перегружать сервер
    files.reduce(function (chain, file) {
      return chain.then(function () {
        return Api.uploadWork(file).then(function (work) {
          saved++;
          var img = document.createElement('img');
          img.src = Api.mediaUrl(work.url);
          img.alt = 'Загруженное фото';
          thumbs.appendChild(img);
        }).catch(function (err) {
          errors.push(file.name + ': ' + (err.status ? err.message : 'нет связи с сервером'));
        });
      });
    }, Promise.resolve()).then(function () {
      attachBtn.disabled = false;
      input.value = '';
      var html = '';
      if (saved) html += 'Сохранено фото: ' + saved + '. Они появились в «<a href="../profile-works/profile-works.html"><u>Ваших работах</u></a>».';
      if (errors.length) html += (html ? '<br>' : '') + errors.map(Api.esc).join('<br>');
      setStatus(html, !saved);
    });
  });
})();
