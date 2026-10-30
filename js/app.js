(function () {
  var K_TOKEN = 'authToken';
  var GUEST = '../profile-guest/profile-guest.html';
  var PROFILE = '../profile/profile.html';

  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function del(key) { try { localStorage.removeItem(key); } catch (e) {} }

  del('loggedIn');

  function safeNext() {
    var next = new URLSearchParams(location.search).get('next');
    if (!next || next.charAt(0) !== '/' || next.charAt(1) === '/' || next.indexOf('\\') !== -1) return null;
    return next;
  }

  var App = {
    loginRequired: false,

    getToken: function () { return get(K_TOKEN); },
    isLoggedIn: function () { return !!get(K_TOKEN); },
    setSession: function (token) { set(K_TOKEN, token); },
    logout: function () { del(K_TOKEN); },

    loginUrl: function () {
      return '../auth-login/auth-login.html?next=' + encodeURIComponent(location.pathname + location.search);
    },
    nextUrl: safeNext,

    requireLogin: function () {
      App.loginRequired = true;
      if (!App.isLoggedIn()) location.replace(GUEST);
    },
    redirectIfLoggedIn: function () {
      if (App.isLoggedIn()) location.replace(safeNext() || PROFILE);
    },
    onSessionExpired: function () {
      App.logout();
      if (App.loginRequired) location.replace(GUEST);
      else location.reload();
    }
  };
  window.App = App;
})();
