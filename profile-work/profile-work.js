App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var root = document.getElementById('work-root');
  if (!id) { location.replace('../profile-works/profile-works.html'); return; }

  var PREV = '<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var NEXT = '<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  function render(item) {
    var urls = item.images.map(function (im) { return Api.mediaUrl(im.url); });
    var many = urls.length > 1;

    document.title = item.title + ' — тренировка рисования';
    document.getElementById('work-title').textContent = item.title;

    root.innerHTML =
      '<div class="viewer">' +
        '<div class="viewer-track" id="track">' +
          urls.map(function (u, i) {
            return '<button class="viewer-slide" type="button" data-i="' + i + '" aria-label="Увеличить фото ' + (i + 1) + '"><img src="' + Api.esc(u) + '" alt="' + Api.esc(item.title) + '"></button>';
          }).join('') +
        '</div>' +
        (many
          ? '<button class="viewer-arrow viewer-prev" type="button" id="prev" aria-label="Предыдущее фото">' + PREV + '</button>' +
            '<button class="viewer-arrow viewer-next" type="button" id="next" aria-label="Следующее фото">' + NEXT + '</button>' +
            '<span class="viewer-count" id="count"></span>'
          : '') +
      '</div>' +
      (many ? '<div class="viewer-dots" id="dots">' + urls.map(function () { return '<i></i>'; }).join('') + '</div>' : '') +
      '<div class="card work-meta">' +
        '<div class="tags-row">' + item.tags.map(function (t) { return '<span class="tag">' + Api.esc(t) + '</span>'; }).join('') + '</div>' +
        '<span class="muted">' + Api.esc(item.date) + (many ? ' · ' + urls.length + ' фото' : '') + '</span>' +
      '</div>' +
      '<div class="stack" style="margin-top:auto">' +
        '<button class="btn danger block" type="button" id="remove">Удалить</button>' +
        '<a class="btn block" href="../profile-works/profile-works.html">Назад</a>' +
      '</div>';

    var track = document.getElementById('track');
    var current = 0;

    function sync() {
      current = Math.round(track.scrollLeft / track.clientWidth);
      if (!many) return;
      document.getElementById('count').textContent = (current + 1) + ' / ' + urls.length;
      document.getElementById('prev').disabled = current === 0;
      document.getElementById('next').disabled = current === urls.length - 1;
      Array.prototype.forEach.call(document.querySelectorAll('#dots i'), function (d, i) {
        d.className = i === current ? 'on' : '';
      });
    }

    function scrollTo(i) {
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }

    track.addEventListener('scroll', sync);
    track.addEventListener('click', function (e) {
      var slide = e.target.closest('[data-i]');
      if (slide) Lightbox.open(urls, parseInt(slide.getAttribute('data-i'), 10));
    });
    if (many) {
      document.getElementById('prev').addEventListener('click', function () { scrollTo(Math.max(0, current - 1)); });
      document.getElementById('next').addEventListener('click', function () { scrollTo(Math.min(urls.length - 1, current + 1)); });
    }
    sync();

    document.getElementById('remove').addEventListener('click', function () {
      var text = many ? 'Удалить альбом (' + urls.length + ' фото)? Это нельзя отменить.' : 'Удалить эту работу? Это нельзя отменить.';
      if (!confirm(text)) return;
      Api.del('/me/gallery/' + encodeURIComponent(item.id)).then(function () {
        location.replace('../profile-works/profile-works.html');
      }).catch(function () { Api.showError(root); });
    });
  }

  Api.get('/me/gallery/' + encodeURIComponent(id)).then(render).catch(function (err) {
    if (err.status === 404) return location.replace('../profile-works/profile-works.html');
    Api.showError(root);
  });
});
