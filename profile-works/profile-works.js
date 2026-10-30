App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('works-grid');
  var deleteBtn = document.getElementById('delete-selected');
  var editToggle = document.getElementById('edit');

  var STACK = '<svg class="ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="14" height="14" rx="2"/><path d="M17 3H5a2 2 0 0 0-2 2v12"/></svg>';
  var MAX_TAGS = 2;     // сколько тегов помещается на плитке, остальные видны на странице работы

  function tags(item) {
    var shown = item.tags.slice(0, MAX_TAGS).map(function (t) { return '<span class="tag">' + Api.esc(t) + '</span>'; });
    if (item.tags.length > MAX_TAGS) shown.push('<span class="tag more">+' + (item.tags.length - MAX_TAGS) + '</span>');
    return '<span class="tags">' + shown.join('') + '</span>';
  }

  function render(items) {
    if (!items.length) {
      grid.innerHTML = '<div class="card pad-lg empty"><p class="big" style="font-size:17px">Работ пока нет</p>' +
        '<p class="muted" style="margin:6px 0 0">Прикрепите фото после тренировки или к теме челленджа</p></div>';
      return;
    }
    grid.innerHTML = items.map(function (item) {
      var cover = Api.esc(Api.mediaUrl(item.images[0].url));
      var label = item.title + ' · ' + item.tags.join(', ');
      return '<label class="tile" title="' + Api.esc(label) + '">' +
        '<a class="tile-link" href="../profile-work/profile-work.html?id=' + item.id + '">' +
          '<img src="' + cover + '" alt="' + Api.esc(label) + '" loading="lazy">' +
          (item.images.length > 1 ? '<span class="count">' + STACK + item.images.length + '</span>' : '') +
          tags(item) +
        '</a>' +
        '<input type="checkbox" value="' + item.id + '"><span class="mark"></span></label>';
    }).join('');
  }

  function load() {
    return Api.get('/me/gallery').then(render).catch(function () { Api.showError(grid); });
  }

  deleteBtn.addEventListener('click', function () {
    var ids = Array.prototype.map.call(grid.querySelectorAll('input:checked'), function (i) { return i.value; });
    if (!ids.length) return;
    if (!confirm('Удалить выбранные работы (' + ids.length + ')? Это нельзя отменить.')) return;

    deleteBtn.disabled = true;
    Promise.all(ids.map(function (id) { return Api.del('/me/gallery/' + encodeURIComponent(id)); }))
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
