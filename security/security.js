App.requireLogin();

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('change-password-form');
  var message = document.getElementById('password-message');
  var submit = document.getElementById('change-password-submit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var currentPassword = document.getElementById('current-password').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;
    message.textContent = '';
    message.style.color = 'var(--accent)';

    if (newPassword.length < 6 || newPassword.length > 128) {
      message.textContent = 'Новый пароль должен быть от 6 до 128 символов';
      return;
    }
    if (newPassword !== confirmPassword) {
      message.textContent = 'Новые пароли не совпадают';
      return;
    }
    if (currentPassword === newPassword) {
      message.textContent = 'Новый пароль должен отличаться от текущего';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Сохраняем…';
    Api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
      .then(function (result) {
        message.style.color = 'var(--accent)';
        message.textContent = result.message || 'Пароль успешно изменён';
        form.reset();
      })
      .catch(function (err) {
        message.textContent = err.message || 'Не удалось изменить пароль';
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = 'Изменить пароль';
      });
  });
});
