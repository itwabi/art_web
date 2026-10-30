(function () {
  var BASE = 'http://127.0.0.1:8000/api';

  function request(method, path) {
    return fetch(BASE + path, { method: method }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.status === 204 ? null : res.json();
    });
  }

  window.Api = {
    get: function (path) { return request('GET', path); },
    post: function (path) { return request('POST', path); },
    del: function (path) { return request('DELETE', path); },

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
