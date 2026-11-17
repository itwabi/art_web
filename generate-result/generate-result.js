(function () {
  var selection = { theme: true, idea: true, palette: true };
  try {
    var saved = JSON.parse(sessionStorage.getItem('genSelection'));
    if (saved) selection = saved;
  } catch (e) {}

  var cards = {
    theme: document.getElementById('card-theme'),
    idea: document.getElementById('card-idea'),
    palette: document.getElementById('card-palette')
  };
  var themeEl = document.getElementById('theme-text');
  var ideaEl = document.getElementById('idea-text');
  var paletteEl = document.getElementById('palette-box');
  var saveButton = document.getElementById('save-generation');
  var saveStatus = document.getElementById('save-status');

  var current = { theme: null, idea: null, palette: null };

  function setSaveStatus(message, isError) {
    saveStatus.textContent = message;
    saveStatus.style.color = isError ? 'var(--accent)' : 'var(--muted)';
  }

  function showError() {
    var msg = 'Не удалось загрузить. Проверьте, что бэкенд запущен.';
    if (selection.theme) themeEl.textContent = msg;
    else if (selection.idea) ideaEl.textContent = msg;
    else paletteEl.textContent = msg;
  }

  function generate() {
    saveButton.disabled = true;
    setSaveStatus('');
    var query = ['theme=' + !!selection.theme, 'idea=' + !!selection.idea, 'palette=' + !!selection.palette];
    if (current.theme) query.push('prev_theme=' + encodeURIComponent(current.theme));
    if (current.idea) query.push('prev_idea=' + encodeURIComponent(current.idea));
    if (current.palette) query.push('prev_palette=' + encodeURIComponent(current.palette.join(',')));

    Api.get('/generate?' + query.join('&')).then(function (r) {
      if (selection.theme && r.theme) { current.theme = r.theme; themeEl.textContent = r.theme; }
      if (selection.idea && r.idea) { current.idea = r.idea; ideaEl.textContent = r.idea; }
      if (selection.palette && r.palette) {
        current.palette = r.palette;
        paletteEl.innerHTML = r.palette.map(function (c) {
          return '<i style="background:' + Api.esc(c) + '"></i>';
        }).join('');
      }
      saveButton.disabled = false;
    }).catch(function () {
      showError();
      saveButton.disabled = false;
    });
  }

  Object.keys(cards).forEach(function (k) {
    cards[k].style.display = selection[k] ? '' : 'none';
  });

  saveButton.addEventListener('click', function () {
    if (!App.isLoggedIn()) {
      setSaveStatus('Чтобы сохранять генерации, войдите в профиль.', true);
      location.href = App.loginUrl();
      return;
    }

    var payload = {
      theme: current.theme || '',
      idea: current.idea || '',
      palette: current.palette || []
    };
    if (!payload.theme && !payload.idea && !payload.palette.length) {
      setSaveStatus('Сначала создайте генерацию.', true);
      return;
    }

    var title = payload.theme || payload.idea || 'Цветовая палитра';
    payload.title = title.length > 100 ? title.slice(0, 100) : title;
    saveButton.disabled = true;
    Api.post('/me/generations', payload).then(function () {
      setSaveStatus('Генерация сохранена в профиле.');
      saveButton.disabled = false;
    }).catch(function (err) {
      setSaveStatus(err.message || 'Не удалось сохранить генерацию.', true);
      saveButton.disabled = false;
    });
  });

  document.getElementById('regen').addEventListener('click', generate);
  generate();
})();
