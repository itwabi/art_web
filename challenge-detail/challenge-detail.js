(function () {
  var params = new URLSearchParams(location.search);
  var c = App.byId(params.get('id')) || App.challenges[0];
  var root = document.getElementById('ch-root');

  document.title = c.title + ' — тренировка рисования';
  document.getElementById('ch-title').textContent = c.title;
  document.getElementById('back').setAttribute('href',
    params.get('from') === 'profile' ? '../profile-challenges/profile-challenges.html'
      : c.kind === 'permanent' ? '../challenges-permanent/challenges-permanent.html' : '../challenges-calendar/challenges-calendar.html');

  var IMG = '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-9 7"/></svg>';
  var ATTACH = '<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/></svg>';
  var ALERT = '<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';

  function render(showWarning) {
    var joined = App.isLoggedIn() && App.isJoined(c.id);
    var shown = c.topics.slice(0, 8).map(function (t) {
      return '<div class="topic"><span>' + t + '</span>' + (joined ? IMG : '') + '</div>';
    }).join('');
    var html =
      '<div class="card"><p class="cap">ОПИСАНИЕ И УСЛОВИЯ</p><p style="margin:0;line-height:1.5">' + c.desc + '</p></div>' +
      '<div class="card"><p class="cap">СПИСОК ТЕМ</p>' + shown +
      '<p class="hint">… и ещё ' + (c.topics.length - 8) + '</p></div>';

    if (joined) {
      html += '<div class="stack">' +
        '<button class="btn block" type="button">' + ATTACH + ' Прикрепить фото</button>' +
        '<button class="btn danger block" type="button" id="leave">Отменить участие</button></div>';
    } else {
      if (showWarning) {
        html += '<div class="notice" role="alert">' + ALERT +
          '<div><p>Нельзя участвовать в челлендже, пока вы не вошли в профиль.</p>' +
          '<a class="btn small" href="../profile-guest/profile-guest.html">Войти в аккаунт</a></div></div>';
      }
      html += '<button class="btn primary block" type="button" id="join">Участвовать</button>';
    }
    root.innerHTML = html;

    var join = document.getElementById('join');
    if (join) join.addEventListener('click', function () {
      if (!App.isLoggedIn()) return render(true);  
      App.join(c.id);
      render(false);
    });
    var leave = document.getElementById('leave');
    if (leave) leave.addEventListener('click', function () {
      App.leave(c.id);
      render(false);
    });
  }
  render(false);
})();
