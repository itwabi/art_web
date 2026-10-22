(function () {
  var K_AUTH = 'loggedIn';
  var K_JOINED = 'joinedChallenges';

  var topics31 = [], topics10 = [];
  for (var i = 1; i <= 31; i++) topics31.push('День ' + i + ': тема');
  for (var j = 1; j <= 10; j++) topics10.push('Задание ' + j);

  var CHALLENGES = [
    { id: 'c1', kind: 'calendar', title: 'Inktober', dates: '01.10.2026 – 31.10.2026', desc: 'Один рисунок тушью в день в течение октября. Тема дня берётся из официального списка. Допустимы любые материалы, но основа — линия и тушь.', topics: topics31 },
    { id: 'c2', kind: 'calendar', title: 'MerMay', dates: '01.05.2026 – 31.05.2026', desc: 'Майский марафон русалок: рисуем по одному персонажу в день.', topics: topics31 },
    { id: 'c3', kind: 'calendar', title: 'Drawtober', dates: '01.10.2026 – 31.10.2026', desc: 'Свободный октябрьский марафон без жёстких правил.', topics: topics31 },
    { id: 'p1', kind: 'permanent', title: '100 дней рисования', dates: null, desc: 'Рисуйте минимум 15 минут каждый день в течение 100 дней.', topics: topics10 },
    { id: 'p2', kind: 'permanent', title: 'Скетчбук-марафон', dates: null, desc: 'Одна страница скетчбука в день на любую тему.', topics: topics10 }
  ];

  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function del(key) { try { localStorage.removeItem(key); } catch (e) {} }

  var App = {
    challenges: CHALLENGES,
    byId: function (id) {
      for (var k = 0; k < CHALLENGES.length; k++) if (CHALLENGES[k].id === id) return CHALLENGES[k];
      return null;
    },

    isLoggedIn: function () { return get(K_AUTH) === '1'; },
    login: function () { set(K_AUTH, '1'); },
    logout: function () { del(K_AUTH); del(K_JOINED); },

  
    getJoined: function () {
      try { return JSON.parse(get(K_JOINED)) || []; } catch (e) { return []; }
    },
    isJoined: function (id) { return App.getJoined().indexOf(id) !== -1; },
    join: function (id) {
      var list = App.getJoined();
      if (list.indexOf(id) === -1) list.push(id);
      set(K_JOINED, JSON.stringify(list));
    },
    leave: function (id) {
      set(K_JOINED, JSON.stringify(App.getJoined().filter(function (x) { return x !== id; })));
    },

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
