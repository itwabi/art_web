(function () {
  var KEY = 'theme';
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  });
})();
