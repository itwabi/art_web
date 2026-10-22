(function () {
  var KEY = 'sketchSettings';

  var timeEl = document.getElementById('time');
  var countEl = document.getElementById('count');
  var orderEl = document.getElementById('order');
  var chipsBox = document.getElementById('categories');
  var errorEl = document.getElementById('cat-error');
  var startBtn = document.getElementById('start');

  var inputs = Array.prototype.slice.call(chipsBox.querySelectorAll('input'));

  function label(input) {
    return input.nextElementSibling.textContent.trim();
  }

  // порядок, в котором пользователь выбирал категории
  var picked = inputs.filter(function (i) { return i.checked; }).map(label);

  inputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var name = label(input);
      picked = picked.filter(function (n) { return n !== name; });
      if (input.checked) picked.push(name);
      errorEl.style.display = 'none';
    });
  });

  startBtn.addEventListener('click', function (e) {
    if (!picked.length) {
      e.preventDefault();
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
