App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('works-grid');

  Api.get('/me/works').then(function (works) {
    grid.innerHTML = works.map(function (w) {
      return '<label class="tile" style="--c:' + Api.esc(w.color) + '"><input type="checkbox"><span class="mark"></span></label>';
    }).join('');
  }).catch(function () { Api.showError(grid); });
});
