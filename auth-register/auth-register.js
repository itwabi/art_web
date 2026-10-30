App.redirectIfLoggedIn();

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('auth-form');
  var nickname = document.getElementById('nickname');
  var password = document.getElementById('password');
  var password2 = document.getElementById('password2');
  var hint = document.getElementById('rules-hint');
  var errorEl = document.getElementById('auth-error');
  var submit = document.getElementById('submit');
  var switchLink = document.getElementById('switch');

  switchLink.search = location.search;

  function showError(text) {
    errorEl.textContent = text;
    errorEl.style.display = text ? 'flex' : 'none';
  }

  Api.get('/auth/rules').then(function (r) {
    nickname.maxLength = r.nickname_max;
    password.maxLength = r.password_max;
    password2.maxLength = r.password_max;
    hint.textContent = 'Никнейм: от ' + r.nickname_min + ' до ' + r.nickname_max + ' символов. Пароль: не короче ' + r.password_min + ' символов.';
  }).catch(function () {});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!nickname.value.trim() || !password.value) return showError('Заполните никнейм и пароль');
    if (password.value !== password2.value) return showError('Пароли не совпадают');
    showError('');
    submit.disabled = true;
    Api.post('/auth/register', { nickname: nickname.value, password: password.value }).then(function (res) {
      App.setSession(res.token);
      location.replace(App.nextUrl() || '../profile/profile.html');
    }).catch(function (err) {
      submit.disabled = false;
      showError(err.status ? err.message : 'Нет связи с сервером. Проверьте, что бэкенд запущен');
    });
  });
});
