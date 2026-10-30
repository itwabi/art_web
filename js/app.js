(function () {
  var K_AUTH = 'loggedIn';

  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function del(key) { try { localStorage.removeItem(key); } catch (e) {} }

  var App = {
    isLoggedIn: function () { return get(K_AUTH) === '1'; },
    login: function () { set(K_AUTH, '1'); },
    logout: function () { del(K_AUTH); },

    requireLogin: function () { if (!App.isLoggedIn()) location.replace('../profile-guest/profile-guest.html'); },
    redirectIfLoggedIn: function () { if (App.isLoggedIn()) location.replace('../profile/profile.html'); }
  };
  window.App = App;

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) return;
    var action = el.getAttribute('data-action');
    if (action === 'login') App.login();
    if (action === 'logout') App.logout();
  });
})();
