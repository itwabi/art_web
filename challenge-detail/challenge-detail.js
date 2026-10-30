(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var root = document.getElementById('ch-root');
  if (!id) { location.replace('../challenges/challenges.html'); return; }

  var PREVIEW = 8;            // сколько тем показываем, пока список свёрнут
  var c = null;
  var joined = false;
  var works = [];             // мои фото к темам этого челленджа
  var showAll = false;        // развёрнут ли список тем
  var panelOpen = false;      // открыта ли форма «Прикрепить фото»
  var selectedTopic = null;   // тема, выбранная в форме
  var status = null;          // сообщение под формой: { text, error }

  var ATTACH = '<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/></svg>';
  var ALERT = '<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';

  function workOf(topicId) {
    for (var i = 0; i < works.length; i++) if (works[i].topic_id === topicId) return works[i];
    return null;
  }

  function firstFreeTopic() {
    for (var i = 0; i < c.topics.length; i++) if (!workOf(c.topics[i].id)) return c.topics[i];
    return c.topics[0];
  }

  function topicRows() {
    var list = showAll ? c.topics : c.topics.slice(0, PREVIEW);
    return list.map(function (t) {
      var w = joined ? workOf(t.id) : null;
      var thumb = w
        ? '<button class="topic-open" type="button" data-photo="' + Api.esc(Api.mediaUrl(w.url)) + '" aria-label="Открыть фото"><img class="topic-thumb" src="' + Api.esc(Api.mediaUrl(w.url)) + '" alt=""></button>'
        : '';
      return '<div class="topic"><span>' + Api.esc(t.title) + '</span>' + thumb + '</div>';
    }).join('');
  }

  function uploadPanel() {
    if (selectedTopic === null) selectedTopic = firstFreeTopic().id;
    var options = c.topics.map(function (t) {
      return '<option value="' + t.id + '"' + (t.id === selectedTopic ? ' selected' : '') + '>' +
        (workOf(t.id) ? '✓ ' : '') + Api.esc(t.title) + '</option>';
    }).join('');
    return '<div class="card stack" id="upload-panel">' +
      '<div class="field"><label for="topic-select">Тема</label><div class="select"><select id="topic-select">' + options + '</select></div></div>' +
      '<div class="field"><label for="photo-input">Фото рисунка</label><input type="file" id="photo-input" accept="image/*"></div>' +
      '<button class="btn primary block" type="button" id="upload">Загрузить</button>' +
      '<p class="upload-status' + (status && status.error ? ' err' : '') + '" id="upload-status" role="status">' + (status ? Api.esc(status.text) : '') + '</p>' +
      '<p class="hint" style="margin:0">Если к теме уже есть фото, новое заменит его.</p>' +
      '</div>';
  }

  function render(showWarning) {
    var more = '';
    if (c.topics.length > PREVIEW) {
      more = '<div class="card-actions"><button class="btn small" type="button" id="toggle-topics">' +
        (showAll ? 'Свернуть список' : 'Показать все темы (' + c.topics.length + ')') + '</button></div>';
    }
    var html =
      '<div class="card"><p class="cap">ОПИСАНИЕ И УСЛОВИЯ</p><p style="margin:0;line-height:1.5">' + Api.esc(c.description) + '</p></div>' +
      '<div class="card"><p class="cap">СПИСОК ТЕМ</p>' + topicRows() + more + '</div>';

    if (joined) {
      html += '<div class="stack">' +
        '<button class="btn block" type="button" id="attach-toggle">' + ATTACH + ' Прикрепить фото</button>' +
        (panelOpen ? uploadPanel() : '') +
        '<button class="btn danger block" type="button" id="leave">Отменить участие</button></div>';
    } else {
      if (showWarning) {
        html += '<div class="notice" role="alert">' + ALERT +
          '<div><p>Нельзя участвовать в челлендже, пока вы не вошли в профиль.</p>' +
          '<a class="btn small" href="../profile-guest/profile-guest.html">Войти в аккаунт</a></div></div>';
      }
      html += '<button class="btn primary block" type="button" id="join">Участвовать</button>';
    }
    root.innerHTML = html;
    bind();
  }

  function setStatus(text, isError) {
    var el = document.getElementById('upload-status');
    el.textContent = text;
    el.className = 'upload-status' + (isError ? ' err' : '');
  }

  function loadWorks() {
    return Api.get('/me/works?challenge_id=' + encodeURIComponent(c.id)).then(function (list) { works = list; });
  }

  function bind() {
    Array.prototype.forEach.call(root.querySelectorAll('[data-photo]'), function (btn) {
      btn.addEventListener('click', function () { Lightbox.open([btn.getAttribute('data-photo')]); });
    });

    var join = document.getElementById('join');
    if (join) join.addEventListener('click', function () {
      if (!App.isLoggedIn()) return render(true);
      Api.post('/me/challenges/' + encodeURIComponent(c.id)).then(function () {
        joined = true;
        return loadWorks();
      }).then(function () { render(false); }).catch(function () { Api.showError(root); });
    });

    var leave = document.getElementById('leave');
    if (leave) leave.addEventListener('click', function () {
      Api.del('/me/challenges/' + encodeURIComponent(c.id)).then(function () {
        joined = false;
        panelOpen = false;
        render(false);
      }).catch(function () { Api.showError(root); });
    });

    var toggleTopics = document.getElementById('toggle-topics');
    if (toggleTopics) toggleTopics.addEventListener('click', function () { showAll = !showAll; render(false); });

    var attachToggle = document.getElementById('attach-toggle');
    if (attachToggle) attachToggle.addEventListener('click', function () {
      panelOpen = !panelOpen;
      status = null;
      render(false);
    });

    var topicSelect = document.getElementById('topic-select');
    if (topicSelect) topicSelect.addEventListener('change', function () {
      selectedTopic = parseInt(topicSelect.value, 10);
    });

    var upload = document.getElementById('upload');
    if (upload) upload.addEventListener('click', function () {
      var file = document.getElementById('photo-input').files[0];
      if (!file) return setStatus('Сначала выберите файл с фотографией', true);

      upload.disabled = true;
      setStatus('Загрузка…', false);
      Api.uploadWork(file, c.id, selectedTopic).then(function (work) {
        return loadWorks().then(function () {
          status = { text: 'Фото прикреплено к теме «' + work.topic_title + '»', error: false };
          selectedTopic = firstFreeTopic().id;
          render(false);
        });
      }).catch(function (err) {
        upload.disabled = false;
        setStatus(err.status ? err.message : 'Нет связи с сервером. Проверьте, что бэкенд запущен', true);
      });
    });
  }

  var requests = [Api.get('/challenges/' + encodeURIComponent(id))];
  if (App.isLoggedIn()) {
    requests.push(Api.get('/me/challenges'));
    requests.push(Api.get('/me/works?challenge_id=' + encodeURIComponent(id)));
  }

  Promise.all(requests).then(function (r) {
    c = r[0];
    joined = r[1] ? r[1].some(function (x) { return x.id === c.id; }) : false;
    works = r[2] || [];

    document.title = c.title + ' — тренировка рисования';
    document.getElementById('ch-title').textContent = c.title;
    document.getElementById('back').setAttribute('href',
      params.get('from') === 'profile' ? '../profile-challenges/profile-challenges.html'
        : c.kind === 'permanent' ? '../challenges-permanent/challenges-permanent.html' : '../challenges-calendar/challenges-calendar.html');
    render(false);
  }).catch(function () { Api.showError(root); });
})();
