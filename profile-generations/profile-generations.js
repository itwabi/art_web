App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var box = document.getElementById('gen-list');

  function render(list) {
    if (!list.length) {
      box.innerHTML = '<div class="card pad-lg"><p class="big" style="font-size:17px">Сохранённых генераций пока нет</p></div>';
      return;
    }

    box.innerHTML = list.map(function (g) {
      var parts = '';
      if (g.theme) parts += '<div><p class="cap">ТЕМА</p><p style="margin:0 0 12px">' + Api.esc(g.theme) + '</p></div>';
      if (g.idea) parts += '<div><p class="cap">ИДЕЯ</p><p style="margin:0 0 12px">' + Api.esc(g.idea) + '</p></div>';
      if (g.palette && g.palette.length) {
        parts += '<div><p class="cap">ПАЛИТРА</p><div class="palette">' + g.palette.map(function (color) {
          return '<i title="' + Api.esc(color) + '" style="background:' + Api.esc(color) + '"></i>';
        }).join('') + '</div></div>';
      }
      return '<article class="card stack">' +
        '<div class="row" style="justify-content:space-between;align-items:center"><strong>' + Api.esc(g.title) + '</strong>' +
        '<button class="btn small danger" type="button" data-delete="' + g.id + '">Удалить</button></div>' +
        parts + '</article>';
    }).join('');

    Array.prototype.forEach.call(box.querySelectorAll('[data-delete]'), function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-delete');
        button.disabled = true;
        Api.del('/me/generations/' + encodeURIComponent(id)).then(function () {
          return Api.get('/me/generations');
        }).then(render).catch(function () {
          button.disabled = false;
          Api.showError(box);
        });
      });
    });
  }

  Api.get('/me/generations').then(render).catch(function () { Api.showError(box); });
});
