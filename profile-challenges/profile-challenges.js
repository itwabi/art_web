App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var box = document.getElementById('my-list');

  Api.get('/me/challenges').then(function (mine) {
    if (!mine.length) {
      box.innerHTML = '<div class="card pad-lg"><p class="big" style="font-size:17px">Вы пока не участвуете ни в одном челлендже</p>' +
        '<p class="muted" style="margin:6px 0 0">Выберите челлендж в галерее и нажмите «Участвовать»</p></div>';
      return;
    }
    box.innerHTML = mine.map(function (c) {
      return '<div class="list-card"><span>' + Api.esc(c.title) + '</span>' +
        '<a class="btn small" href="../challenge-detail/challenge-detail.html?id=' + encodeURIComponent(c.id) + '&from=profile">подробно</a></div>';
    }).join('');
  }).catch(function () { Api.showError(box); });
});
