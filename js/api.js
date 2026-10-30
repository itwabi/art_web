(function () {
  var BASE = 'http://127.0.0.1:8000/api';

  // body — необязательный FormData (для загрузки файлов); Content-Type браузер ставит сам
  function request(method, path, body) {
    var options = { method: method };
    if (body) options.body = body;
    return fetch(BASE + path, options).then(function (res) {
      if (res.ok) return res.status === 204 ? null : res.json();
      return res.json().catch(function () { return {}; }).then(function (data) {
        var err = new Error(typeof data.detail === 'string' ? data.detail : 'Ошибка запроса (' + res.status + ')');
        err.status = res.status;
        throw err;
      });
    });
  }

  window.Api = {
    get: function (path) { return request('GET', path); },
    post: function (path) { return request('POST', path); },
    del: function (path) { return request('DELETE', path); },

    // Загрузка фото в «Ваши работы». Если указать challengeId и topicId — фото прикрепится к теме челленджа
    uploadWork: function (file, challengeId, topicId) {
      var form = new FormData();
      form.append('file', file);
      if (challengeId && topicId) {
        form.append('challenge_id', challengeId);
        form.append('topic_id', topicId);
      }
      return request('POST', '/me/works', form);
    },

    uploadAlbum: function (files, categories) {
      var form = new FormData();
      files.forEach(function (f) { form.append('files', f); });
      if (categories && categories.length) form.append('categories', categories.join(','));
      return request('POST', '/me/gallery', form);
    },

    mediaUrl: function (path) {
      return BASE.replace(/\/api$/, '') + path;
    },

    esc: function (value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    showError: function (el) {
      el.innerHTML = '<div class="card pad-lg"><p class="big" style="font-size:17px">Не удалось загрузить данные</p>' +
        '<p class="muted" style="margin:6px 0 0">Проверьте, что бэкенд запущен, и обновите страницу</p></div>';
    }
  };
})();
