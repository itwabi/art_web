(function () {
  var KEY = 'sketchSettings';
  var CATEGORY_ERROR = 'Выберите хотя бы одну категорию';

  var timeEl = document.getElementById('time');
  var countEl = document.getElementById('count');
  var orderEl = document.getElementById('order');
  var chipsBox = document.getElementById('categories');
  var errorEl = document.getElementById('cat-error');
  var startBtn = document.getElementById('start');

  var picked = [];

  function label(input) {
    return input.nextElementSibling.textContent.trim();
  }

  Api.get('/sketch/categories').then(function (cats) {
    chipsBox.innerHTML = cats.map(function (c, i) {
      return '<label class="chip"><input type="checkbox"' + (i === 0 ? ' checked' : '') + '><span>' + Api.esc(c.name) + '</span></label>';
    }).join('');

    var inputs = Array.prototype.slice.call(chipsBox.querySelectorAll('input'));
    picked = inputs.filter(function (i) { return i.checked; }).map(label);

    inputs.forEach(function (input) {
      input.addEventListener('change', function () {
        var name = label(input);
        picked = picked.filter(function (n) { return n !== name; });
        if (input.checked) picked.push(name);
        errorEl.style.display = 'none';
      });
    });
  }).catch(function () {
    errorEl.textContent = 'Не удалось загрузить категории. Проверьте, что бэкенд запущен.';
    errorEl.style.display = 'flex';
  });

  startBtn.addEventListener('click', function (e) {
    if (!picked.length) {
      e.preventDefault();
      if (chipsBox.children.length) errorEl.textContent = CATEGORY_ERROR;
      errorEl.style.display = 'flex';
      return;
    }
    var settings = {
      seconds: parseInt(timeEl.value, 10) * 60,
      count: parseInt(countEl.value, 10),
      order: orderEl.value === 'Случайный' ? 'random' : 'ordered',
      categories: picked
    };
    try { sessionStorage.setItem(KEY, JSON.stringify(settings)); } catch (err) {}
  });
})();
