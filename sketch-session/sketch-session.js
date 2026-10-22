(function () {
  var SETTINGS_KEY = 'sketchSettings';
  var RESULT_KEY = 'sketchResult';
  var FINISH_URL = '../sketch-finish/sketch-finish.html';
  var DEFAULTS = { seconds: 60, count: 10, order: 'random', categories: ['Позы'] };

  var timerEl = document.getElementById('timer');
  var barEl = document.getElementById('bar');
  var infoEl = document.getElementById('frame-info');
  var frameEl = document.getElementById('frame');
  var nextBtn = document.getElementById('next');
  var finishBtn = document.getElementById('finish');

  function loadSettings() {
    try {
      var s = JSON.parse(sessionStorage.getItem(SETTINGS_KEY));
      if (s && s.seconds > 0 && s.count > 0 && s.categories && s.categories.length) return s;
    } catch (e) {}
    return DEFAULTS;
  }

  function buildFrames(s) {
    var cats = s.categories, frames = [], last = null;
    for (var i = 0; i < s.count; i++) {
      var cat;
      if (s.order === 'ordered') {
        cat = cats[i % cats.length];
      } else {
        do { cat = cats[Math.floor(Math.random() * cats.length)]; }
        while (cats.length > 1 && cat === last);
      }
      frames.push(cat);
      last = cat;
    }
    return frames;
  }

  var settings = loadSettings();
  var frames = buildFrames(settings);
  var total = frames.length;
  var frameMs = settings.seconds * 1000;

  var index = 0;
  var deadline = 0;
  var spentMs = 0;       // сколько реально потрачено на уже пройденные кадры
  var timerId = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function renderTime(remainingMs) {
    var sec = Math.ceil(remainingMs / 1000);
    timerEl.textContent = pad(Math.floor(sec / 60)) + ':' + pad(sec % 60);
    barEl.style.width = (remainingMs / frameMs * 100) + '%';
  }

  function showFrame() {
    infoEl.textContent = 'Кадр ' + (index + 1) + ' из ' + total + ' · ' + frames[index];
    deadline = Date.now() + frameMs;
    renderTime(frameMs);
    // анимация «перелистывания»
    frameEl.classList.remove('flip');
    void frameEl.offsetWidth;
    frameEl.classList.add('flip');
  }

  function finish(viewed) {
    clearInterval(timerId);
    spentMs += frameMs - Math.max(0, deadline - Date.now());
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify({
        frames: viewed,
        seconds: Math.round(spentMs / 1000)
      }));
    } catch (e) {}
    location.href = FINISH_URL;
  }

  function next() {
    if (index >= total - 1) return finish(total);
    spentMs += frameMs - Math.max(0, deadline - Date.now());
    index++;
    showFrame();
  }

  function tick() {
    var remaining = deadline - Date.now();
    if (remaining <= 0) return next();
    renderTime(remaining);
  }

  nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); });
  finishBtn.addEventListener('click', function (e) { e.preventDefault(); finish(index + 1); });

  showFrame();
  timerId = setInterval(tick, 100);
})();
