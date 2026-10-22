(function () {
  var THEMES = [
    'Заброшенная библиотека', 'Подводный город', 'Ночной рынок', 'Маяк на краю света',
    'Старая оранжерея', 'Космическая станция', 'Лесная ярмарка', 'Город в облаках',
    'Пустынный оазис', 'Зимний вокзал', 'Мастерская часовщика', 'Остров музыкантов'
  ];
  var IDEAS = [
    'Лиса, читающая книгу при свете светлячков', 'Робот, поливающий цветы на крыше',
    'Кит, плывущий над городом', 'Девочка и дракон пьют чай', 'Кот-астроном с телескопом',
    'Сова-почтальон в грозу', 'Старик, который собирает звёзды в банки',
    'Лодка, плывущая по небу', 'Медведь-пекарь на рассвете', 'Дерево, внутри которого живёт дом',
    'Ёжик на воздушном шаре', 'Улитка, несущая маленький город'
  ];
  var PALETTES = [
    ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
    ['#003049', '#D62828', '#F77F00', '#FCBF49', '#EAE2B7'],
    ['#355070', '#6D597A', '#B56576', '#E56B6F', '#EAAC8B'],
    ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25'],
    ['#05668D', '#028090', '#00A896', '#02C39A', '#F0F3BD'],
    ['#22223B', '#4A4E69', '#9A8C98', '#C9ADA7', '#F2E9E4'],
    ['#8ECAE6', '#219EBC', '#023047', '#FFB703', '#FB8500'],
    ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF']
  ];

  var selection = { theme: true, idea: true, palette: true };
  try {
    var saved = JSON.parse(sessionStorage.getItem('genSelection'));
    if (saved) selection = saved;
  } catch (e) {}

  var cards = {
    theme: document.getElementById('card-theme'),
    idea: document.getElementById('card-idea'),
    palette: document.getElementById('card-palette')
  };
  var themeEl = document.getElementById('theme-text');
  var ideaEl = document.getElementById('idea-text');
  var paletteEl = document.getElementById('palette-box');

  var current = { theme: null, idea: null, palette: null };

  function pick(list, prev) {
    var item;
    do { item = list[Math.floor(Math.random() * list.length)]; }
    while (list.length > 1 && item === prev);
    return item;
  }

  function generate() {
    if (selection.theme) { current.theme = pick(THEMES, current.theme); themeEl.textContent = current.theme; }
    if (selection.idea) { current.idea = pick(IDEAS, current.idea); ideaEl.textContent = current.idea; }
    if (selection.palette) {
      current.palette = pick(PALETTES, current.palette);
      paletteEl.innerHTML = current.palette.map(function (c) {
        return '<i style="background:' + c + '"></i>';
      }).join('');
    }
  }

  // показываем только выбранные пункты
  Object.keys(cards).forEach(function (k) {
    cards[k].style.display = selection[k] ? '' : 'none';
  });

  document.getElementById('regen').addEventListener('click', generate);
  generate();
})();
