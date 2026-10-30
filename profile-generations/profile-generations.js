App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var box = document.getElementById('gen-list');

  Api.get('/me/generations').then(function (list) {
    if (!list.length) {
      box.innerHTML = '<div class="card pad-lg"><p class="big" style="font-size:17px">Сохранённых генераций пока нет</p></div>';
      return;
    }
    box.innerHTML = list.map(function (g) {
      return '<div class="list-card"><span>' + Api.esc(g.title) + '</span>' +
        '<a class="btn small" href="../generate-result/generate-result.html">подробно</a></div>';
    }).join('');
  }).catch(function () { Api.showError(box); });
});
