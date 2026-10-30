(function () {
  var track = document.getElementById('track');

  var PREV = '<svg class="ic " width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var NEXT = '<svg class="ic " width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  Api.get('/challenges?kind=permanent').then(function (list) {
    if (!list.length) {
      track.innerHTML = '<div class="card pad-lg"><p class="big" style="font-size:17px">Челленджей пока нет</p></div>';
      return;
    }
    track.innerHTML = list.map(function (c, i) {
      var prev = list[(i - 1 + list.length) % list.length].id;
      var next = list[(i + 1) % list.length].id;
      return '<div class="slide" id="' + Api.esc(c.id) + '">' +
        '<div class="slide-row">' +
          '<a class="arrow" href="#' + Api.esc(prev) + '" aria-label="Предыдущий">' + PREV + '</a>' +
          '<div class="card"><strong>' + Api.esc(c.title) + '</strong>' + '<span class="muted">Без ограничения по датам</span>' + '</div>' +
          '<a class="arrow" href="#' + Api.esc(next) + '" aria-label="Следующий">' + NEXT + '</a>' +
        '</div>' +
        '<a class="btn primary" href="../challenge-detail/challenge-detail.html?id=' + encodeURIComponent(c.id) + '" style="min-width:180px">Подробнее</a>' +
      '</div>';
    }).join('');
  }).catch(function () { Api.showError(track); });
})();
