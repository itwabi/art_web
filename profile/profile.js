App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  function days(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' день';
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + ' дня';
    return n + ' дней';
  }

  document.querySelector('[data-action="logout"]').addEventListener('click', function (e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    Api.post('/auth/logout').catch(function () {}).then(function () {
      App.logout();
      location.href = href;
    });
  });

  Api.get('/me').then(function (me) {
    document.getElementById('avatar').textContent = me.nickname.charAt(0).toUpperCase();
    document.getElementById('nickname').textContent = me.nickname;
    document.getElementById('streak').textContent = 'Серия: ' + days(me.streak_days);
  }).catch(function () {
    document.getElementById('nickname').textContent = 'Нет связи с сервером';
  });
});
