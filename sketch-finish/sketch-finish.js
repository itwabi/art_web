(function () {
  var el = document.getElementById('finish-summary');
  var result = null;
  try { result = JSON.parse(sessionStorage.getItem('sketchResult')); } catch (e) {}
  if (!result) return;

  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' набросок';
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + ' наброска';
    return n + ' набросков';
  }

  var time = result.seconds < 60
    ? 'меньше минуты'
    : 'около ' + Math.round(result.seconds / 60) + ' мин';

  el.textContent = plural(result.frames) + ' · ' + time;
})();
