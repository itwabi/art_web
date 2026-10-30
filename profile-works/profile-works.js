App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('works-grid');
  var deleteBtn = document.getElementById('delete-selected');
  var editToggle = document.getElementById('edit');

  function caption(w) {
    if (w.challenge_title) return w.challenge_title + (w.topic_title ? ' · ' + w.topic_title : '');
    return 'После тренировки';
  }

  function render(works) {
    if (!works.length) {
      grid.innerHTML = '<div class="card pad-lg empty"><p class="big" style="font-size:17px">Работ пока нет</p>' +
        '<p class="muted" style="margin:6px 0 0">Прикрепите фото после тренировки или к теме челленджа</p></div>';
      return;
    }
    grid.innerHTML = works.map(function (w) {
      var url = Api.esc(Api.mediaUrl(w.url));
      return '<label class="tile" title="' + Api.esc(caption(w)) + '">' +
        '<a class="tile-link" href="' + url + '" target="_blank" rel="noopener"><img src="' + url + '" alt="' + Api.esc(caption(w)) + '" loading="lazy"></a>' +
        '<input type="checkbox" value="' + w.id + '"><span class="mark"></span></label>';
    }).join('');
  }

  function load() {
    return Api.get('/me/works').then(render).catch(function () { Api.showError(grid); });
  }

  deleteBtn.addEventListener('click', function () {
    var ids = Array.prototype.map.call(grid.querySelectorAll('input:checked'), function (i) { return i.value; });
    if (!ids.length) return;
    if (!confirm('Удалить выбранные работы (' + ids.length + ')? Это нельзя отменить.')) return;

    deleteBtn.disabled = true;
    Promise.all(ids.map(function (id) { return Api.del('/me/works/' + encodeURIComponent(id)); }))
      .then(load)
      .catch(function () { Api.showError(grid); })
      .then(function () { deleteBtn.disabled = false; });
  });

  // при выходе из режима редактирования снимаем выделение
  editToggle.addEventListener('change', function () {
    Array.prototype.forEach.call(grid.querySelectorAll('input:checked'), function (i) { i.checked = false; });
  });

  load();
});
