App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  (function () {
    var box = document.getElementById('my-list');
    var mine = App.challenges.filter(function (c) { return App.isJoined(c.id); });
    if (!mine.length) {
      box.innerHTML = '<div class="card pad-lg"><p class="big" style="font-size:17px">Вы пока не участвуете ни в одном челлендже</p>' +
        '<p class="muted" style="margin:6px 0 0">Выберите челлендж в галерее и нажмите «Участвовать»</p></div>';
      return;
    }
    box.innerHTML = mine.map(function (c) {
      return '<div class="list-card"><span>' + c.title + '</span>' +
        '<a class="btn small" href="../challenge-detail/challenge-detail.html?id=' + c.id + '&from=profile">подробно</a></div>';
    }).join('');
  })();
});
