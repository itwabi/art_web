App.redirectIfLoggedIn();

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('auth-form');
  var nickname = document.getElementById('nickname');
  var password = document.getElementById('password');
  var errorEl = document.getElementById('auth-error');
  var submit = document.getElementById('submit');
  var switchLink = document.getElementById('switch');

  switchLink.search = location.search;

  function showError(text) {
    errorEl.textContent = text;
    errorEl.style.display = text ? 'flex' : 'none';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!nickname.value.trim() || !password.value) return showError('Введите никнейм и пароль');
    showError('');
    submit.disabled = true;
    Api.post('/auth/login', { nickname: nickname.value, password: password.value }).then(function (res) {
      App.setSession(res.token);
      location.replace(App.nextUrl() || '../profile/profile.html');
    }).catch(function (err) {
      submit.disabled = false;
      showError(err.status ? err.message : 'Нет связи с сервером. Проверьте, что бэкенд запущен');
    });
  });
});
