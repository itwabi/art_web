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

  var current = { theme: null, idea: null, palette: null };

  function showError() {
    var msg = 'Не удалось загрузить. Проверьте, что бэкенд запущен.';
    if (selection.theme) themeEl.textContent = msg;
    else if (selection.idea) ideaEl.textContent = msg;
    else paletteEl.textContent = msg;
  }

  function generate() {
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
    }).catch(showError);
  }

  Object.keys(cards).forEach(function (k) {
    cards[k].style.display = selection[k] ? '' : 'none';
  });

  document.getElementById('regen').addEventListener('click', generate);
  generate();
})();
